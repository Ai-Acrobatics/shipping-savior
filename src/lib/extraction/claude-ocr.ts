import Anthropic from '@anthropic-ai/sdk';
import type { ExtractedShipmentData, ExtractionResult } from '@/lib/types/extraction';

const EXTRACTION_PROMPT = `You are a logistics document OCR specialist. Extract structured shipment data from this document image/PDF.

Analyze the document and extract ALL available fields into this JSON schema. Only include fields that are clearly present in the document — do not guess or fabricate data.

Return ONLY valid JSON matching this structure (omit null/empty fields):

{
  "documentType": "bill_of_lading | commercial_invoice | packing_list | customs_declaration | certificate_of_origin | isf_filing | arrival_notice | other",
  "shipper": {
    "name": "string",
    "address": "string",
    "country": "string"
  },
  "consignee": {
    "name": "string",
    "address": "string",
    "country": "string"
  },
  "notifyParty": {
    "name": "string",
    "address": "string"
  },
  "ports": {
    "origin": "Port name",
    "originCode": "UN/LOCODE",
    "destination": "Port name",
    "destinationCode": "UN/LOCODE",
    "transshipment": "Port name if applicable"
  },
  "vessel": {
    "name": "string",
    "voyage": "string"
  },
  "containers": [
    {
      "number": "ABCD1234567",
      "sealNumber": "string",
      "type": "20GP | 40GP | 40HC | 45HC | 20RF | 40RF",
      "weight": "string with unit",
      "volume": "string with unit"
    }
  ],
  "cargo": {
    "description": "string",
    "hsCode": "string (e.g. 0803.90.00)",
    "quantity": "string",
    "grossWeight": "string",
    "weightUnit": "KG | LBS | MT",
    "volume": "string",
    "volumeUnit": "CBM | CFT",
    "packageCount": "string",
    "packageType": "string (e.g. CARTONS, PALLETS, DRUMS)"
  },
  "financials": {
    "totalValue": "string",
    "currency": "USD | EUR | CNY | etc.",
    "freightCharges": "string",
    "insuranceValue": "string",
    "incoterm": "FOB | CIF | EXW | DDP | etc."
  },
  "references": {
    "billOfLadingNumber": "string",
    "bookingNumber": "string",
    "poNumber": "string",
    "invoiceNumber": "string",
    "letterOfCreditNumber": "string"
  },
  "dates": {
    "shipmentDate": "YYYY-MM-DD",
    "etd": "YYYY-MM-DD",
    "eta": "YYYY-MM-DD",
    "invoiceDate": "YYYY-MM-DD"
  },
  "additionalNotes": "string"
}

Also provide a confidence score (0-100) indicating how confident you are in the overall extraction accuracy.

Return your response as:
{"data": { ...extracted fields... }, "confidence": 85}`;

type SupportedMediaType =
  | 'application/pdf'
  | 'image/png'
  | 'image/jpeg'
  | 'image/webp'
  | 'image/gif';

export async function extractFromDocument(
  fileBase64: string,
  mediaType: SupportedMediaType,
): Promise<ExtractionResult> {
  const client = new Anthropic({
    apiKey: process.env.ANTHROPIC_API_KEY,
  });

  // Claude accepts PDFs as `document` blocks and raster images as `image` blocks.
  // The content union differs per block type, so we build them separately.
  const source =
    mediaType === 'application/pdf'
      ? ({
          type: 'base64' as const,
          media_type: 'application/pdf' as const,
          data: fileBase64,
        })
      : ({
          type: 'base64' as const,
          media_type: mediaType,
          data: fileBase64,
        });

  const documentBlock =
    mediaType === 'application/pdf'
      ? ({ type: 'document' as const, source: source as Anthropic.Base64PDFSource })
      : ({ type: 'image' as const, source: source as Anthropic.ImageBlockParam['source'] });

  const content: Anthropic.MessageCreateParams['messages'][0]['content'] = [
    documentBlock,
    {
      type: 'text',
      text: EXTRACTION_PROMPT,
    },
  ];

  const response = await client.messages.create({
    model: 'claude-sonnet-4-20250514',
    max_tokens: 4096,
    messages: [
      {
        role: 'user',
        content,
      },
    ],
  });

  const textBlock = response.content.find((block) => block.type === 'text');
  if (!textBlock || textBlock.type !== 'text') {
    throw new Error('No text response from Claude');
  }

  const rawText = textBlock.text;

  // Extract JSON from response (handle markdown code blocks)
  const jsonMatch = rawText.match(/```(?:json)?\s*([\s\S]*?)```/) || [null, rawText];
  const jsonStr = (jsonMatch[1] || rawText).trim();

  let parsed: { data: ExtractedShipmentData; confidence: number };
  try {
    parsed = JSON.parse(jsonStr);
  } catch {
    // Try to find JSON object in the response
    const objMatch = rawText.match(/\{[\s\S]*\}/);
    if (!objMatch) {
      throw new Error('Failed to parse extraction response as JSON');
    }
    parsed = JSON.parse(objMatch[0]);
  }

  return {
    data: parsed.data,
    confidence: Math.min(100, Math.max(0, parsed.confidence || 0)),
    rawText,
  };
}
