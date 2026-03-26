# PRD: AI Tariff Classifier

## Overview
- **Purpose:** Use AI to predict the correct HTS tariff classification for products based on text descriptions and optional images. Reduces the time and expertise needed for tariff classification by surfacing the top predictions with confidence scores and supporting CBP rulings.
- **User persona:** Importers who need to classify new products without deep tariff expertise, freight brokers helping clients determine duty rates, compliance officers verifying classifications.
- **Entry points:** Main navigation "AI Classifier" link, "Classify this product" action from HTS Lookup when unsure of code, direct URL `/tools/ai-classifier`.

## Page Layout

### Desktop (1280px+)
- **Left column (50%):** Input section. Large text area for product description. Image upload zone (drag-and-drop). Country of origin dropdown. "Classify" button.
- **Right column (50%):** Results section (empty until classification runs). Top 3 HTS code predictions as cards ranked by confidence. Below cards: supporting CBP rulings panel. Below rulings: action buttons (Accept, Override, History).
- **Below fold:** Classification history table (recent 20 classifications). Accuracy metrics display.

### Tablet (768px-1279px)
- Input full-width above, results full-width below. Side panel for rulings.

### Mobile (< 768px)
- Input as single column. Results stacked below. Cards full-width. Rulings in expandable accordion.

## Features & Functionality

### Feature: Product Description Input
- **Description:** Rich text input for describing the product to classify. The more detail provided, the higher the classification accuracy.
- **User interaction flow:**
  1. User enters product description in text area
  2. Placeholder shows example: "e.g., Men's athletic shoes with rubber outsoles and textile uppers, valued at $8.50/pair, manufactured in Vietnam"
  3. Character counter shows current/max (50-2000 characters)
  4. Helper text: "Include: material composition, intended use, construction method, value per unit"
  5. Optional: structured fields for material (dropdown), use case (dropdown), value range
- **Edge cases:**
  - Too short (<50 chars): "Provide more detail for accurate classification. Include materials, use, and construction."
  - Very long (>2000 chars): truncate with warning
  - Non-English input: "Please provide description in English for best results"
- **Validation rules:** Required, 50-2000 characters, no HTML/script injection.

### Feature: Product Image Upload (Optional)
- **Description:** Upload a product image to improve classification accuracy. AI analyzes visual characteristics alongside text description.
- **User interaction flow:**
  1. Drag-and-drop zone or click to select file
  2. Image preview shown after upload
  3. Supported: JPG, PNG, WebP (max 10MB)
  4. Image is analyzed alongside text description
  5. "Remove image" button to clear
- **Edge cases:**
  - Image without text: "Please also provide a text description for best results"
  - Very large image: auto-resize on client before upload
  - Unsupported format: "Please upload a JPG, PNG, or WebP image"
  - Image analysis adds ~2s to classification time

### Feature: Top 3 HTS Code Predictions
- **Description:** AI returns the top 3 most likely HTS classifications ranked by confidence percentage.
- **Card layout (per prediction):**
  - Rank badge (#1, #2, #3)
  - HTS code (with dots for readability)
  - Full description from HTS schedule
  - Confidence percentage (progress bar: green >80%, yellow 50-80%, red <50%)
  - General duty rate
  - Country-specific rate (if country selected)
  - "View in HTS Lookup" link
  - "Accept" primary action button
- **User interaction flow:**
  1. Click "Classify" to submit
  2. Loading state: "Analyzing product..." with animated progress
  3. Results appear as 3 ranked cards
  4. User reviews predictions and supporting evidence
  5. Clicks "Accept" on correct classification
  6. OR clicks "Override" to manually select the correct code
- **Edge cases:**
  - Low confidence on all predictions (<50%): warning banner "Low confidence. Please review carefully or consult a customs broker."
  - Only 1-2 predictions returned: show available with note
  - Classification fails: "Unable to classify. Check your description and try again."
  - Identical confidence on top 2: show both at same rank with note

### Feature: Supporting CBP Rulings Panel
- **Description:** Display relevant CBP CROSS rulings that support each HTS classification prediction, providing human-verifiable evidence.
- **Details:**
  - For each prediction, show 2-3 most relevant rulings
  - Each ruling: ruling number (linked to CBP CROSS), date, product description excerpt, HTS classification
  - Relevance score indicator
  - "View full ruling" expands to show complete ruling text or links to CBP website
- **Edge cases:**
  - No relevant rulings found: "No matching CBP rulings found. Classification is based on AI analysis of the HTS schedule."
  - Ruling supports a different code than predicted: show as "Alternative classification" with explanation.

### Feature: Accept Classification
- **Description:** User confirms the AI prediction is correct, saving it for use in calculators.
- **User interaction flow:**
  1. Click "Accept" on the correct prediction card
  2. Classification saved to history
  3. Options presented: "Use in Landed Cost Calculator" or "Use in HTS Lookup" or "Done"
  4. Selected HTS code and rate passed to target tool
- **Edge cases:** Accepting a low-confidence classification: confirmation dialog "This classification has [X]% confidence. Are you sure?"

### Feature: Override Classification
- **Description:** User selects the correct HTS code manually when AI prediction is wrong. This feedback trains the model over time.
- **User interaction flow:**
  1. Click "Override" button below predictions
  2. HTS code search input appears (same as HTS Lookup search)
  3. User searches and selects the correct code
  4. Reason dropdown: "Wrong chapter", "Wrong heading", "Wrong subheading", "Wrong statistical suffix"
  5. Optional comment for why the override was needed
  6. Override saved as training feedback
- **Edge cases:** Override with same code as a prediction: "This code was already suggested as option #X. Did you mean to Accept it?"

### Feature: Classification History
- **Description:** Table of past classifications for reference and reuse.
- **Columns:** Date, Product Description (truncated), Predicted Code, Accepted/Overridden Code, Confidence, Status (Accepted/Overridden/Pending).
- **Interactions:** Click row to view full classification details. "Reclassify" action to re-run with same description. Sort by date or confidence.
- **Edge cases:** No history: "No previous classifications. Submit your first product for classification."

### Feature: Accuracy Metrics Display
- **Description:** Show the AI model's accuracy metrics to build user trust and transparently communicate limitations.
- **Metrics shown:**
  - Overall accuracy at 6-digit HTS level (e.g., "57.5%")
  - Overall accuracy at 4-digit HTS level (e.g., "74%")
  - Total classifications processed
  - User acceptance rate
  - Note: "Based on ATLAS benchmark data. Accuracy improves with user feedback."
- **Disclaimer:** "AI classification is a starting point. Always verify with the official USITC HTS schedule. For binding rulings, consult CBP."

## Usability Requirements
- **Accessibility (WCAG 2.1 AA):** Text area has proper label. Image upload zone has keyboard alternative and `aria-label`. Prediction cards use heading hierarchy (h3). Confidence bars have text labels. Rulings are in semantic list markup.
- **Keyboard navigation:** Tab from text area to image upload to country to classify button. Tab through prediction cards. Enter accepts a prediction. Tab to history table.
- **Loading states:** Classification in progress: skeleton prediction cards with "Analyzing..." text and progress bar (estimated 3-8 seconds). Rulings loading: skeleton list.
- **Error states:** API failure: "Classification service unavailable. Try again later." Timeout (>30s): "Classification is taking longer than expected. Try a shorter description." Image analysis failure: "Unable to analyze image. Classification will proceed with text only."
- **Empty states:** Before first classification: example classification shown with sample product and results. "Try classifying your first product" CTA.
- **Performance targets:** LCP < 2.0s. Classification response < 8s (including rulings lookup). History table renders < 500ms.

## API Endpoints

### POST /api/hts/classify
- **Description:** Submit a product for AI tariff classification.
- **Authentication required:** Yes
- **Request body:**
  ```json
  {
    "description": "Men's athletic shoes with rubber outsoles and textile uppers, designed for running, valued at $8.50 per pair",
    "image": "base64-encoded-string (optional)",
    "countryOfOrigin": "VN",
    "structuredFields": {
      "primaryMaterial": "rubber",
      "secondaryMaterial": "textile",
      "useCase": "athletic_footwear",
      "valuePerUnit": 8.50,
      "valueCurrency": "USD"
    }
  }
  ```
- **Response (200):**
  ```json
  {
    "classificationId": "cls-uuid",
    "predictions": [
      {
        "rank": 1,
        "htsCode": "6404.11.9040",
        "description": "Sports footwear with outer soles of rubber/plastics and uppers of textile materials",
        "confidence": 0.82,
        "generalDutyRate": "20%",
        "countryRate": {
          "country": "VN",
          "rate": "20%",
          "section301": false,
          "adcvd": false
        },
        "supportingRulings": [
          {
            "rulingNumber": "NY N312456",
            "date": "2025-06-15",
            "productExcerpt": "Men's lace-up athletic shoes with rubber outsoles and woven textile uppers",
            "htsCode": "6404.11.9040",
            "relevanceScore": 0.91
          }
        ]
      },
      {
        "rank": 2,
        "htsCode": "6402.99.4060",
        "description": "Other footwear with outer soles and uppers of rubber or plastics",
        "confidence": 0.12,
        "generalDutyRate": "20%",
        "supportingRulings": [...]
      },
      {
        "rank": 3,
        "htsCode": "6404.19.3560",
        "description": "Footwear with outer soles of rubber/plastics and uppers of textile, other",
        "confidence": 0.04,
        "generalDutyRate": "37.5%",
        "supportingRulings": [...]
      }
    ],
    "metadata": {
      "modelVersion": "atlas-v2.1",
      "processingTimeMs": 4200,
      "imageAnalyzed": true,
      "htsDataDate": "2026-03-15"
    }
  }
  ```
- **Error responses:**
  - 400: `{ "error": "description_too_short", "message": "Description must be at least 50 characters" }`
  - 429: `{ "error": "rate_limited", "message": "Classification limit reached. Upgrade your plan for more." }`
  - 503: `{ "error": "model_unavailable", "message": "Classification service temporarily unavailable" }`
- **Rate limiting:** 20 classifications per hour (Starter), 100/hour (Professional), unlimited (Enterprise).

### GET /api/hts/classify/history
- **Description:** Get user's classification history.
- **Authentication required:** Yes
- **Request parameters:**
  - `page` (number, optional, default 1)
  - `limit` (number, optional, default 20)
- **Response (200):**
  ```json
  {
    "classifications": [
      {
        "id": "cls-uuid",
        "description": "Men's athletic shoes...",
        "topPrediction": { "htsCode": "6404.11.9040", "confidence": 0.82 },
        "acceptedCode": "6404.11.9040",
        "status": "accepted",
        "classifiedAt": "2026-03-26T12:00:00Z"
      }
    ],
    "pagination": { "page": 1, "limit": 20, "total": 45 }
  }
  ```

### POST /api/hts/classify/:id/feedback
- **Description:** Submit feedback (accept or override) on a classification.
- **Authentication required:** Yes
- **Request body:**
  ```json
  {
    "action": "accept | override",
    "acceptedCode": "6404.11.9040",
    "overrideCode": null,
    "overrideReason": null,
    "comment": null
  }
  ```
- **Response (200):**
  ```json
  {
    "classificationId": "cls-uuid",
    "status": "accepted",
    "savedAt": "2026-03-26T12:05:00Z"
  }
  ```

## Data Requirements
- **Database tables read/written:**
  - `ai_classifications` (read/write) — id, orgId, userId, description, imageUrl, countryOfOrigin, predictions (JSONB), acceptedCode, overriddenCode, overrideReason, status, modelVersion, processingTimeMs, createdAt
  - `cbp_rulings` (read) — for supporting evidence (220K+ rulings, vector-indexed for similarity search)
  - `hts_codes` (read) — for duty rate lookup on predictions
- **External data sources:**
  - AI model endpoint (Anthropic Claude or fine-tuned LLaMA for classification)
  - CBP CROSS rulings database (pre-scraped and vector-embedded for RAG)
  - USITC HTS schedule for code validation
- **Caching strategy:** Classification results cached per ID indefinitely (immutable after creation). CBP rulings vector index cached in memory. Model not cached (real-time inference).

## Component Breakdown
- **Server Components:** `AiClassifierPage` (layout, fetch history).
- **Client Components:** `ClassificationForm` (text area + image upload + country), `PredictionCard` (per result), `PredictionCardList`, `RulingsPanel`, `AcceptButton`, `OverrideFlow` (search + reason), `ClassificationHistory` (table), `AccuracyMetrics`, `ConfidenceBar`, `ImageUploadZone`.
- **Shared components used:** `Card`, `Button`, `Input`, `Select`, `Badge`, `Tooltip`, `Skeleton`, `Table`, `Modal`, `FileUpload`, `ProgressBar`.
- **New components needed:** `ClassificationForm`, `PredictionCard`, `RulingsPanel`, `AcceptButton`, `OverrideFlow`, `ClassificationHistory`, `AccuracyMetrics`, `ConfidenceBar`, `ImageUploadZone`.

## Acceptance Criteria
- [ ] Text description input accepts 50-2000 characters with helper text
- [ ] Image upload accepts JPG, PNG, WebP up to 10MB
- [ ] Classification returns top 3 predictions within 8 seconds
- [ ] Each prediction shows HTS code, description, confidence %, and duty rate
- [ ] Confidence bars are color-coded (green >80%, yellow 50-80%, red <50%)
- [ ] Supporting CBP rulings appear for each prediction with ruling number and relevance
- [ ] "Accept" action saves classification and offers navigation to calculators
- [ ] "Override" action allows manual HTS code selection with reason
- [ ] Classification history shows past 20 classifications
- [ ] Low confidence (<50% on all predictions) triggers warning banner
- [ ] Accuracy metrics display with model version and disclaimer
- [ ] Rate limiting enforced by plan tier
- [ ] Disclaimer about non-binding nature appears on all views
- [ ] Mobile layout stacks input above results
- [ ] Empty state shows example classification

## Dependencies
- **This page depends on:** Authentication (PRD-APP-01). AI model endpoint (Claude API or custom model). CBP rulings database (vector-indexed). HTS code data (PRD-APP-03) for code validation and rate lookup.
- **Pages that depend on this:** HTS Lookup (PRD-APP-03) links from "Not sure? Try AI Classifier." Landed Cost Calculator (PRD-APP-04) receives accepted classification. Compliance Center (PRD-APP-13) may reference AI classifications for audit.
