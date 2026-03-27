# PRD: Container Utilization Calculator

## Overview
- **Purpose:** Calculate how many product units fit in a shipping container considering both volume and weight constraints. Displays the limiting factor (volume or weight) and calculates cost-per-unit at scale. A simple but high-value tool that prevents costly shipping miscalculations.
- **User persona:** Importers planning container orders, procurement managers estimating per-unit shipping costs, freight brokers optimizing container loads for clients.
- **Entry points:** Main navigation "Container Calc" link, "Calculate container fit" from Landed Cost Calculator, direct URL `/tools/container-calc`.

## Page Layout

### Desktop (1280px+)
- **Left column (50%):** Input form with two sections: Product Dimensions and Container Selection.
- **Right column (50%, sticky):** Results panel with: dual utilization bars (volume % and weight %), visual container fill indicator (3D isometric or 2D cross-section), units per container, cost per unit, pallet configuration summary.
- **Below fold:** Comparison table showing results across all container types simultaneously.

### Tablet (768px-1279px)
- Single column. Form above results. Container fill indicator simplified to 2D.

### Mobile (< 768px)
- Single column. Simplified visual (horizontal fill bars instead of container graphic). Comparison table scrolls horizontally.

## Features & Functionality

### Feature: Product Dimension Inputs
- **Description:** Enter product unit dimensions and weight for container calculation.
- **Fields:**
  - Product name (text, optional — for saved calculations)
  - Length per unit (cm or inches, toggle)
  - Width per unit (cm or inches)
  - Height per unit (cm or inches)
  - Weight per unit (kg or lbs, toggle)
  - Units per carton/case (number, optional — for carton-level packing)
  - Carton dimensions (L x W x H, optional — if packing in cartons)
  - Carton weight (total with product, optional)
- **User interaction flow:**
  1. User enters individual unit dimensions and weight
  2. Optionally enters carton packing configuration
  3. If carton dimensions provided, calculation uses carton dimensions for stacking
  4. If only unit dimensions, assumes loose packing with configurable packing efficiency
- **Edge cases:**
  - Zero or negative dimensions: prevent input, show "Dimensions must be positive"
  - Extremely small items (< 1cm): valid but show note "Very small items — consider carton-level packing for accuracy"
  - Extremely heavy items (> 100kg/unit): valid but show weight-limit warning early
  - Unit toggle (metric/imperial): convert in real-time, preserve precision
- **Validation rules:**
  - All dimensions: > 0, max 4 decimal places
  - Weight: > 0, max 3 decimal places
  - Units per carton: integer >= 1

### Feature: Container Type Selector
- **Description:** Select container type to calculate against. Shows specs for each option.
- **Options:**
  - 20ft Standard (5.9m x 2.35m x 2.39m internal, 33.2 CBM, 28,200 kg payload)
  - 40ft Standard (12.03m x 2.35m x 2.39m internal, 67.7 CBM, 28,750 kg payload)
  - 40ft High Cube (12.03m x 2.35m x 2.69m internal, 76.3 CBM, 28,560 kg payload)
  - 40ft Reefer (11.58m x 2.29m x 2.26m internal, 59.3 CBM, 27,700 kg payload)
  - 20ft Reefer (5.44m x 2.29m x 2.27m internal, 28.3 CBM, 27,400 kg payload)
- **Behavior:** Selecting a container type updates the calculation. "Compare All" toggle shows results for all container types simultaneously.
- **Edge cases:** Reefer containers have slightly smaller internal dimensions due to refrigeration equipment — specs are accurate to this.

### Feature: Dual Utilization Display
- **Description:** Show BOTH volume utilization and weight utilization, clearly indicating which is the limiting factor. This prevents the critical pitfall of ignoring weight limits.
- **Display:**
  - Two horizontal progress bars, side by side
  - Volume bar: blue fill, showing X% utilized, "Y CBM of Z CBM"
  - Weight bar: orange fill, showing X% utilized, "Y kg of Z kg"
  - Limiting factor highlighted with bold border and "LIMITING FACTOR" label
  - If volume limits first: weight bar shows extra capacity available
  - If weight limits first: volume bar shows wasted space
- **Calculation logic (using decimal.js):**
  1. Calculate volume per unit/carton in CBM
  2. Calculate max units by volume: floor(container CBM / unit CBM) * packing efficiency
  3. Calculate max units by weight: floor(container payload kg / unit weight kg)
  4. Actual units per container = min(volume units, weight units)
  5. Packing efficiency factor: default 85% for loose, 92% for palletized, 95% for carton stacked
- **Edge cases:**
  - Both limits reached simultaneously (rare): show "Volume and weight limits reached simultaneously"
  - Product is too large for any container: "Product dimensions exceed container internal dimensions"
  - Single unit exceeds container weight limit: "Single unit exceeds container weight capacity"

### Feature: Visual Container Fill Indicator
- **Description:** Graphical representation of how products fill the container.
- **Desktop:** Isometric 3D view of container with stacked units shown as colored blocks. Fill level visually represents utilization percentage. Wasted space shown as semi-transparent.
- **Tablet/Mobile:** 2D cross-section view (front face of container) showing stack height and width.
- **Interaction:** Hover on filled area shows unit count. Toggle between "side view" and "top view."

### Feature: Pallet Configuration Options
- **Description:** Configure pallet-based loading for more accurate calculations.
- **Fields:**
  - Pallet type: Standard (48" x 40"), Euro (120cm x 80cm), Custom
  - Units per pallet layer (auto-calculated from dimensions)
  - Layers per pallet (based on height + pallet height + container ceiling)
  - Pallets per container (auto-calculated from container floor space)
  - Pallet weight (default 20kg)
- **User interaction flow:**
  1. Toggle "Palletized Loading" switch
  2. Select pallet type
  3. System auto-calculates optimal pallet configuration
  4. Results update to show: pallets per container, units per pallet, total units
- **Edge cases:** Pallet dimensions don't divide evenly into container: show optimal arrangement with wasted floor space percentage.

### Feature: Cost Per Unit at Scale
- **Description:** Calculate shipping cost per unit based on container utilization.
- **Fields:**
  - Shipping cost per container (currency input, or "Get from Route Comparison" link)
  - Number of containers (for volume discount estimation)
- **Output:**
  - Cost per unit = container cost / units per container
  - Table showing cost per unit across different container volumes (1, 5, 10, 20 containers)
  - Comparison: "If you increased order to [X] units, cost per unit drops from $Y to $Z"

## Usability Requirements
- **Accessibility (WCAG 2.1 AA):** Utilization bars have text labels (not just color). Container visual has alt text description. Unit toggle (metric/imperial) uses `aria-label` and `aria-pressed`. All inputs labeled.
- **Keyboard navigation:** Tab through inputs. Enter recalculates. Tab to results panel. Tab to comparison table.
- **Loading states:** Calculation is instant (client-side). Container visual may render with slight delay — show skeleton.
- **Error states:** Invalid dimensions: inline field errors. Calculation impossible (too large/heavy): clear message with suggestion.
- **Empty states:** Before any input: show example calculation with sample product (t-shirt, 300g, 30x20x5cm) as placeholder.
- **Performance targets:** LCP < 1.5s. Calculation < 10ms. Container visual renders < 200ms. No API calls needed (all client-side).

## API Endpoints

### POST /api/calculate/container
- **Description:** Server-side container calculation (for batch processing and PDF reports). Primary calculation is client-side.
- **Authentication required:** Yes
- **Request body:**
  ```json
  {
    "product": {
      "name": "Cotton T-Shirt",
      "lengthCm": 30,
      "widthCm": 20,
      "heightCm": 5,
      "weightKg": 0.3,
      "unitsPerCarton": 20,
      "carton": {
        "lengthCm": 60,
        "widthCm": 40,
        "heightCm": 50,
        "weightKg": 7.5
      }
    },
    "containerType": "40ft_hc",
    "pallet": {
      "enabled": true,
      "type": "standard_48x40",
      "weightKg": 20
    },
    "packingEfficiency": 0.92,
    "shippingCostPerContainer": 3500
  }
  ```
- **Response (200):**
  ```json
  {
    "containerType": "40ft_hc",
    "containerSpecs": {
      "internalLengthCm": 1203,
      "internalWidthCm": 235,
      "internalHeightCm": 269,
      "volumeCbm": 76.3,
      "maxPayloadKg": 28560
    },
    "utilization": {
      "volume": {
        "used": 68.5,
        "total": 76.3,
        "percentage": 89.8
      },
      "weight": {
        "used": 22500,
        "total": 28560,
        "percentage": 78.8
      },
      "limitingFactor": "volume"
    },
    "units": {
      "unitsPerContainer": 60000,
      "cartonsPerContainer": 3000,
      "cartonsPerPallet": 24,
      "palletsPerContainer": 125,
      "layersPerPallet": 5,
      "unitsPerPallet": 480
    },
    "pallet": {
      "palletsAcross": 5,
      "palletsDeep": 25,
      "totalPallets": 125,
      "wastedFloorPercent": 3.2
    },
    "costAnalysis": {
      "costPerUnit": 0.0583,
      "costPerCarton": 1.1667,
      "costPerPallet": 28.00
    },
    "allContainers": [
      { "type": "20ft", "units": 28000, "volumeUtil": 88.5, "weightUtil": 37.0, "costPerUnit": 0.0893 },
      { "type": "40ft", "units": 55000, "volumeUtil": 87.2, "weightUtil": 72.4, "costPerUnit": 0.0636 },
      { "type": "40ft_hc", "units": 60000, "volumeUtil": 89.8, "weightUtil": 78.8, "costPerUnit": 0.0583 },
      { "type": "reefer_40ft", "units": 48000, "volumeUtil": 92.1, "weightUtil": 63.1, "costPerUnit": 0.0729 }
    ]
  }
  ```
- **Error responses:**
  - 400: `{ "error": "product_too_large", "message": "Product dimensions exceed container internal dimensions" }`

## Data Requirements
- **Database tables read/written:**
  - `container_specs` (read, static) — type, internalDimensions, volumeCbm, maxPayloadKg, doorDimensions, palletCapacity
  - `saved_calculations` (write) — save container calculations
- **External data sources:** Container specifications are industry-standard (ISO 668, ISO 1496). Static data, no external API needed.
- **Caching strategy:** Container specs cached indefinitely (static). All calculation is client-side.

## Component Breakdown
- **Server Components:** `ContainerCalcPage` (layout only — minimal server component).
- **Client Components:** `ContainerCalculator` (main orchestrator), `ProductDimensionForm`, `ContainerTypeSelector`, `DualUtilizationBars`, `ContainerFillVisual` (canvas/SVG), `PalletConfigurator`, `CostPerUnitPanel`, `AllContainersTable`, `UnitToggle` (metric/imperial).
- **Shared components used:** `Input`, `Select`, `Button`, `Card`, `Badge`, `Tooltip`, `Switch`.
- **New components needed:** `DualUtilizationBars`, `ContainerFillVisual`, `PalletConfigurator`, `UnitToggle`, `CostPerUnitPanel`.

## Acceptance Criteria
- [ ] Dual utilization display shows both volume AND weight percentages
- [ ] Limiting factor (volume or weight) is clearly identified and highlighted
- [ ] Calculation uses decimal.js for precision (no floating-point errors)
- [ ] All 5 container types (20ft, 40ft, 40ft HC, reefer 40ft, reefer 20ft) have accurate specs
- [ ] Pallet configuration correctly calculates pallets per container, units per pallet
- [ ] Cost per unit calculation divides container cost by actual units (using limiting factor)
- [ ] "Compare All" shows results across all container types in a table
- [ ] Unit toggle (metric/imperial) converts without precision loss
- [ ] Visual container fill indicator renders on desktop
- [ ] Product too large for container shows clear error message
- [ ] Dense product scenario (weight-limited) correctly shows weight as limiting factor
- [ ] Light product scenario (volume-limited) correctly shows volume as limiting factor
- [ ] Packing efficiency factor is configurable (default 85% loose, 92% palletized)
- [ ] No API calls required for basic calculation (fully client-side)
- [ ] Empty state shows example calculation with sample product

## Dependencies
- **This page depends on:** Container specs static data. No external dependencies.
- **Pages that depend on this:** Landed Cost Calculator (PRD-APP-04) uses "units per container" from this tool. Route Comparison (PRD-APP-06) links to container calc for cost-per-unit analysis.
