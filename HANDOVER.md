# HUFT Fit Finder — Handover

**Date:** 29 July 2026
**Repo:** `~/Desktop/huft-fit-finder`
**Source decks:** `~/Downloads/drive-download-20260727T073608Z-1-001`
**Database:** `odoov17_prod` (Odoo 17, PostgreSQL, `172.18.11.14:5432`), read-only via DBeaver

---

## 1. What this project is

Build a size recommendation tool for HUFT pet apparel, so a customer picks their dog's breed and gets the right size. The business case: **size is behind 79.5% of all returns**, and online apparel returns run at 16%.

The agreed five steps:

1. **Size master** — every product, size and measurement in one place
2. **Pet-side data** — breed body measurements
3. **Validation using sales** — test against real sales and returns
4. **How we recommend to the user** — our sizing is range-driven, so turning a range into one confident answer is the real design problem
5. **Measuring impact** — conversion and return rate, with return reasons feeding back

Steps 1, 3 and 4 are done. Step 2 is deliberately unfinished (see §7). Step 5 is not started.

---

## 2. The headline findings

All from 12 months of Shopify + POS sales: **182,824 orders, 10,666 returns, 3,110 size swaps**.

| Finding | Number |
|---|---|
| Returns caused by size | **79.5%** of store returns |
| Online return rate | **16.0%** vs 4.9% in store — over 3× worse |
| Direction of size errors | **66.1% go UP** (2,056 up vs 1,054 down), 95% CI 64.4–67.8 |
| Worst product | **Raincoat** — 13.1% returns overall, 26% online, 83.2% of swaps go up |
| Breed measurements | Mostly **confirmed** — only 9 of 54 combinations earned a change |

**Return rate by product (store vs online):**

| Product | Store | Online | Multiple |
|---|---|---|---|
| Kurta | 8.8% | 27.9% | 3.2× |
| Raincoat | 10.8% | 26.0% | 2.4× |
| Dress | 5.9% | 24.7% | 4.2× |
| Sweatshirt | 11.8% | 20.7% | 1.8× |
| T-Shirt | 5.5% | 19.8% | 3.6× |
| Sweater | 7.3% | 18.1% | 2.5× |
| Collar | 2.3% | 9.0% | 3.9× |
| Leash | 2.1% | 7.9% | 3.8× |

**Direction by product** (of swaps, % going UP — over 60% means it runs small):

Raincoat 83.2 · Sweater 81.7 · Dress 76.8 · T-Shirt 75.1 · Kurta 73.4 · Leash & Harness 70.7 · Sweatshirt 62.6 · Jacket 58.5 · Collar 51.5 · **Harness 43.5** · **Bandana 38.6** · **Sherwani 15.6**

Body-hugging garments run small. Strapped/adjustable items run large. Sherwani is the extreme — 84% of people who got it wrong went *down*.

---

## 3. Deliverables — what each file is

All in `~/Desktop/huft-fit-finder`.

### The tool
| File | What it is |
|---|---|
| `index.html` | The fit finder. React + Babel, loads from CDN. Login: `product@headsupfortails.com` / `Sl031095$` |
| `fit-data.js` | **Generated.** All recommendation data. Do not hand-edit — regenerate from the pipeline |
| `product-specs.js` | Garment size charts read off the deck slides. Hand-maintained, traceable to slide + image hash |
| `products-catalog.js` | Odoo product catalogue |

The dashboard has **two cards** (restructured 3 Aug 2026):

**1. Check a fit** — the customer-facing flow, four steps: breed → product → build → size. After the answer, "Check another product for X" drops straight back to step 2 with the breed kept, so a store assistant can size a whole basket without re-entering the dog. The size chart below the answer highlights the recommended row and shows only the columns that category has — collars and harnesses show adjustable neck/chest ranges, leashes show strap width and lead length.

**2. HUFT Catalog** — the internal view, two ways in:
- **By product** — pick category → sub-category → any SKU, and see every breed with its recommended size, measurements, size up, keep rate and new-size flag. A breed filter narrows it. **Download Excel** exports every breed × SKU row for the selected sub-category.
- **By breed** — pick a breed and get every category at once, with the sales verdict on **"do we need a new size"** stated at the top. Also exports to Excel, and can hand the breed to the Ask widget.

Knowledge base and Feedback remain in the left sidebar but are no longer on the dashboard.

Two earlier tabs were removed, both deliberately: the old **Fit checker** (entered product dimensions, showed which breeds it served — ran on superseded numbers) and the old **HUFT Catalog** browse/add-product screen (Odoo catalogue listing with a manual add form). Their components — `CatalogTab`, `AddProductForm`, `ProductsTab`, `ProductEditor`, `SizesTab`, `SizeBox` — were deleted from `index.html`, not just unrouted. If someone needs "add a product by hand" back, it is in git history.

### Analysis outputs
| File | What it is |
|---|---|
| `HUFT_Fit_Matrix_by_SKU.xlsx` | **The main deliverable.** 7,815 breed × product recommendations across **217 products / 15 categories**, all measurements, keep rates, fit quality, and the "do we need a new size" analysis |
| `HUFT_Old_Chart_vs_Sales_Data.xlsx` | The old "Size chart Gallery for all breeds" checked cell by cell against 12 months of sales. 64% agree; where they differ the old chart is usually one size too big, concentrated in accessories and small/toy breeds |
| `HUFT_Raincoat_Size_by_Breed.xlsx` | One sheet per raincoat model |
| `HUFT_Fit_Matrix.xlsx` | Category-level version. Superseded by the SKU file — keep only for the category summary |
| `HUFT_Breed_KB.xlsx` | Breed body dimensions, confidence, sources |
| `HUFT_Deliverable1_Breed_KB.xlsx` | Full evidence and limits behind the KB work |
| `HUFT_Breed_Cleaning.xlsx` | 701 breed spellings mapped to 71 clean breeds |
| `HUFT_Merged_Product_Catalog.xlsx` | Odoo catalogue merged with deck size charts, 4,086 rows |
| `HUFT_Product_Dimensions_Fixed.xlsx` | Product dimensions in a fixed schema, all cm |

### SQL
| File | What it is |
|---|---|
| `huft_fit_pull_v2.sql` | **The pull that produced everything.** Read-only, self-contained, 12 months, both channels |
| `breed_clean_cte.sql` | Breed cleaning as an inline CTE (works read-only) |
| `online_returns_check.sql` | Diagnostics for the credit-note route |

---

## 4. How a recommendation is actually made

### Ten breeds are missing from the breed KB

47 breeds carry sales data; the KB in `index.html` holds 51. They are not the same 47. **Ten breeds with sales data have no KB entry under that name**, and until 3 Aug they therefore had no size group at all and disappeared from every group filter — which is why Small showed 5 breeds instead of 11.

| Breed with sales data | KB status | Group assigned |
|---|---|---|
| Dachshund | KB calls it "Dachshund (Standard)" | Small |
| Greyhound / Sighthound | KB has "Rampur Greyhound" (Native) | Large |
| German Spitz, Bichon Frise, Havanese, Miniature Schnauzer, Cavalier King Charles Spaniel | absent | Small |
| Akita, Dogo Argentino, Pointer / Setter | absent | Large |

`GROUP_FALLBACK` in `FitCatalogTab` fills the group so the filter works. **It fills nothing else** — these ten still have no neck, chest, weight or height in the KB, so they are absent from the Knowledge base screen and from anything measurement-based.

Mapped by hand on purpose. A fuzzy name match would have paired "German Spitz" with "German Shepherd" — a toy breed onto a large one.

**The real fix is to add the ten to the KB properly**, at which point the fallback becomes dead code. Until then, group filters are complete but the KB is not.

### Combined size labels in Odoo are a data fault — do not restore them

Nine gear products carry a size label in Odoo that is not a size HUFT sells: the SKU suffix on `DSDGCLH042` literally reads `XL/2XL`, and others read `XS/S`, `M/L`, `S/M`, `L/XL`. A customer must never be shown two sizes at once, so `build_gear.py` resolves each of these to the single real size (the first half) before anything downstream sees it. `XS/S → XS`, `M/L → M`, `XL/2XL → XL`.

The raw label is kept on the chart as `odooSizes` and surfaced in the catalog, because the **SKU suffix still uses it** — a store assistant ordering `DSDGCLH042XL/2XL` needs to know that is the same thing as the XL we recommend. The catalog shows an amber note on those nine products saying exactly that.

**The right fix is in the product master, not here.** Once Odoo carries real size names, the normalisation becomes a no-op and the amber note disappears on its own.

Affected: Dash Dog Flow Walk-Along, HexaStreak Walk Along, Super Stride Walk Along, Radiant Blaze Easy Walk, Vector Easy Walk, Walk Pro (all Harness), HUFT Trooper Drag Bag, HUFT Basics Leash, HUFT Classic Dog Leash.

### Which size each build takes — clothing and gear differ (3 Aug 2026)

Every recommendation has two candidate sizes: **i**, the size customers kept most, and **j**, one step up that product's own ladder. Which one a build takes depends on the category.

| | Lean | Average | Broad & sturdy |
|---|---|---|---|
| **Clothing** (raincoat, sweater, sweatshirt, t-shirt, kurta, shirt, sherwani, jacket, dress) | i | **j** | j |
| **Gear** (collar, leash, harness, leash & harness, collar & leash, bandana) | i | **i** | j |

Clothing leans large because 66% of the 3,110 recorded exchanges went UP, and a slightly loose garment still works while a tight one comes back.

**Gear deliberately does not, and this is not an oversight.** An adjustable band has a hard lower limit that a garment does not. Checking every gear recommendation against the breed KB measurements: making average take the larger size would raise the share of rows where the band **cannot physically close tight enough** from 13% to 28% overall, and from 31% to 59% for toy breeds. A Chihuahua would have been offered an Xplorers harness in M — a 67–92 cm chest band on a 30–43 cm chest.

The rule lives in exactly two places, `buildSizes()` in `index.html` and `builds()` in `write_all_wb.py`. Change both or neither.

Note the 13% baseline: even at the most-kept size, one gear row in eight has a band that does not overlap the KB measurement. That is the Odoo dimensions and the KB disagreeing, and it is unresolved — see limitation 8.

### Colour variants are merged (added 3 Aug 2026)

Most gear SKUs are the same product in another colour and carry the same size chart, so they were collapsing the same row five times over. Products now merge on **base name + an identical size chart**: 305 → 220. The merged entry keeps every SKU code and lists the colours.

Five products deliberately did NOT merge, because two colours of the same product hold **different measurements in Odoo**. Someone should check whether that is real or a typo:

- HUFT Walkmate Pet Harness — 3 different charts
- HUFT Active Pet Dog Harness, HUFT Xplorers Dog Collar, Dash Dog Flow Padded Dog Collar, HUFT Desi Regal Bandana — 2 each

### Keep rate is a CATEGORY number, not a per-SKU one

`huft_fit_pull_v2.sql` groups by breed, channel, category and size — **not by product code**. So "1,921 kept, 93.6%" against a specific harness is every harness that breed bought, and the same figure repeats down the whole category. The columns are labelled "— whole category" in the tool and the workbook for this reason.

Getting real per-SKU rates means re-running the pull with `base_sku` in the GROUP BY. Be aware that split 220 ways most cells will fall below a usable sample, which is why it was not done this way to begin with.

### Photo-based build detection — built, NOT connected

Step 3 of Check a fit offers a photo upload before falling back to the three build buttons. **Nothing reads the photo yet.** `const BUILD_API = ""` at the top of `index.html` is where a serverless endpoint goes; it should take an image and return `{build, confidence, note}` with build in lean/average/broad. With BUILD_API empty the step says "Photo reading isn't switched on yet" and asks the question instead.

It fails loudly on purpose. Do not make it fall back to a guessed build — a guessed build ships a wrong size, which is the exact failure this whole project exists to reduce.

Two things to settle before building the endpoint: single-photo body condition scoring is genuinely unreliable (coat length reads as bulk, angle changes the answer, vets use two views), and every size check becomes a paid API call. Keep the manual override either way.

### Which measurement picks the size (added 3 Aug 2026)

Not every product is sized on the same thing. The size ladder is walked using the measurement that actually decides fit for that category:

| Category | Sized on |
|---|---|
| Raincoat, Sweater, Sweatshirt, T-Shirt, Kurta, Shirt, Sherwani, Jacket, Dress | back length |
| Collar, Collar & Leash, Bandana | neck |
| Harness, Leash & Harness | chest girth |
| Leash | strap width |

The behavioural step is unchanged — the modal kept size for that breed × category still sets the target. What changed is that the target is then converted to the category's median driving measurement, and matched to the nearest size on **that individual product's own chart**. So two collars with different neck ranges can return different sizes for the same dog, which is correct.


**This matters more than anything else in the handover.**

The recommendation is **not** calculated from body measurements. It comes from what customers **kept**:

```
breed → the size its owners kept most often (12m sales)
      → that size's back length on the median chart for the category
      → the nearest size on THIS SPECIFIC product's own chart
      → the size above it = the "broad & sturdy" option
```

Where the top two sizes are within 10 points of each other, the tie is broken by **which way customers swap** when they get it wrong. On products that run small, the tie goes up.

### Why not from the KB

I tried it first and it produced nonsense — Pomeranian in a 3XL raincoat, Shih Tzu in 2XL. The reason: to convert a body measurement into a garment size you must assume an ease value, and the ease numbers were anchored rather than measured. Small errors in ease compound into whole sizes.

**Do not rebuild the recommendation from KB + ease.** It has been tried and it fails.

### Why product level, not category level

Every product has its own chart. RainBuddie size S is 27 cm back; DD DewDrop size S is 31 cm. A Shih Tzu is **XL in Magical Mist but 2XL in RainBuddie**. Two of the eight kurtas need a different size from the other six for the same dog.

### One nuance to know

The evidence count (`Kept in 12m`) is at **category** level, shared across all products in that category. Golden Retriever raincoat shows 921 for every raincoat model — that's all raincoats kept by Golden Retriever owners, not that model's sales. This is deliberate: splitting 921 across 8 models leaves every cell too thin. The assumption is that a dog's body doesn't change between raincoats, and the chart differences are what matter.

---

## 5. Odoo schema — everything discovered the hard way

This database was **migrated**, and several standard Odoo links did not survive. Anyone re-running this will hit the same walls.

### Size is not where you expect
- `product_variant_combination` — **EMPTY** (0 rows)
- `product_product.combination_indices` — **EMPTY** for all 36,546 variants
- `product_template_attribute_value_sale_order_line_rel` — **EMPTY**
- `pos_order_line_product_template_attribute_value_rel` — **EMPTY**

**Every size is its own product_template.** 5,462 sized variants, 5,462 templates, exactly 1.00 sizes per template. The base SKU is the only thing that groups a product's sizes — 1,488 base SKUs averaging 3.67 sizes each.

**Solution: read size from the SKU suffix.** `HUFTFC8775S` → S, `HUFTFC87752XL` → 2XL. Validated: Clothing parses at 91.6% with a full ladder; Food and Treats parse at 0%, which confirms the regex isn't inventing sizes.

```sql
(regexp_match(upper(trim(pp.default_code)),
  '(2XS|XXS|XXL|7XL|6XL|5XL|4XL|3XL|2XL|XS|XL|S|M|L)$'))[1]
```

**Use an allow-list of categories**, not a deny-list — Pet Toys parses at 4.2% and packaging at 11.9% by accident. Allowed: `Clothing`, `Collars, Leashes & Harnesses`, `Accessories`, `Footwear`.

### Returns live in two completely different places
- `customer_return` — **EMPTY** (0 rows). Ignore it.
- `order_return_request` + `order_return_product_line` — **POS only.** `so_line_id` is null on all 76,921 rows. Filter `request_type='cir'` (customer initiated) and `status='done'`. **`ndr` is non-delivery** — courier failure, exclude it, it says nothing about fit.
- **Online returns are credit notes.** `account_move` where `move_type='out_refund'` and `state='posted'`, joined back to the order line via `sale_order_line_invoice_rel`. 81,220 line-level online returns, 36,692 in the last 12 months.
- No credit note carries `shopify_refund_id` — don't look for it there.

### Return reasons have no direction
The `return_reason` table has **"Size Concern"** but nothing saying too small or too big. Also duplicated with different capitalisation (id 4 "Size Concern", id 27 "Size concern") — group case-insensitively.

Reasons only start **March 2024**, though sales go back to April 2023.

Credit notes have **no reason field at all**, so the 79.5% size-share figure is store-only.

### Exchanges are not recorded
- The refund is a **separate POS order** with negative lines. Verified: 77,332 negative lines, **zero positive lines** on refund orders.
- `return_pos_order_id` points to the refund order, never a replacement, never the original.
- There are **no same-receipt swaps**.

**Direction is reconstructed:** after a return, did the same customer buy the **same base SKU in a different size** within −30 to +60 days and keep it? Up the ladder = it was too small. This recovers direction for **34% of returns**. Use `DISTINCT ON (line_id)` ordered by date proximity — without it, a customer who bought three sizes multiplies their return into three rows and inflates every count.

### Other essentials
- **Breed:** `res_partner_pet.breed` → `pet_breed`. `partner_id` **is** the customer id (Odoo customers are `res_partner`). Filter `coalesce(active,true)`.
- **Orders have no pet link.** Only `partner_id`. In a multi-pet home you cannot tell which dog a size was for — `pets_on_profile` flags them.
- **Online vs store:** `sale_order.shopify_instance_id IS NOT NULL` marks Shopify. POS is `pos_order`.
- **Exclude non-consumer channels.** `huft_sales_channel` includes B2B, Pan India B2B, Export (Dubai/Kuwait/Russia/Singapore/Chikok), Quick Commerce (Blinkit, Zepto, Swiggy, BigBasket, Amazon-S, Flipkart-S), FBA, Warehouse, Franchisee. In all of these the buyer is a business — the size mix reflects stocking decisions, not fit.
- **Order states:** sale `('sale','done')`, POS `('paid','done','invoiced')`.

### Performance
The pull touches ~4M orders. Two things make it viable:
1. **`AS MATERIALIZED` on every CTE.** `base` is referenced three times and Postgres was rebuilding it each time.
2. **Push the filters into the line scan.** Only 103,583 of 970,510 sale orders in 12 months belong to a customer with a pet — filter with `EXISTS` during the scan, not after.

Without these it ran ~10 minutes and returned nothing useful. With them it's a few minutes.

---

## 6. DBeaver quirks that cost time

- **"Blank line is statement delimiter"** is ON by default. It splits a `WITH` block from its final `SELECT`, giving `relation "base" does not exist`. Turn it off: *Settings → Editors → SQL Editor → SQL Processing*. All delivered SQL has blank lines stripped as a workaround.
- **`{{placeholders}}` trigger the bind-parameter dialog.** Don't use them.
- **DBeaver counts brackets inside quoted strings.** A breed named `Dalmatian-Labrador)` broke a 701-row `VALUES` list. Both offending rows are excluded from `breed_clean_cte.sql`.
- **The connection is read-only** — no `CREATE TEMP TABLE`, no `CREATE INDEX`. Use inline CTEs. This is correct and should stay that way.
- **Row fetch defaults to 200.** Raise it or results silently truncate.
- **Export from Query, not Export data.** Select all (⌘A) → right-click → Execute → Export from Query. "Export data" from the grid re-runs the whole query a second time.

---

## 7. Deliberate decisions — and what NOT to undo

### The breed KB body dimensions were NOT updated

Nine changes are *proposed* in `HUFT_Breed_KB.xlsx` → "Changes Made" tab. **They are not applied, on purpose.**

The reason: to derive a body measurement from sales you subtract an assumed ease. Back length was anchored to the ease values already in the code; chest and neck were anchored to the KB's own midpoints. Then the returns showed those ease values are **too small**. So the derived dimensions were computed with an assumption we later disproved — and the chest/neck ones were anchored to the KB, so "they agree with the KB" was partly circular.

What *is* solid is the **relative** picture: a Beagle's back is about 12 cm longer than a Shih Tzu's, regardless of ease. The **absolute** numbers were never tested.

**Sales cannot separate "the dog is bigger" from "the garment has less room."** Both produce identical purchase behaviour. Only measuring real dogs breaks the tie — roughly 20 dogs per breed for the top 15 breeds, measured in store. That's step 2 and it cannot be skipped.

### Mixed breeds
Counted in sales, excluded from body measurement. A Lab-Indie mix has no predictable size.

### Puppies
Tested and cleared. Kept rate 95.6% overall vs 95.5% adults only — age is not distorting anything, so all ages are included. `life_stage` is still carried if you want to re-test.

### Keep rate vs volume
The recommendation uses **most-kept volume**, not keep rate. Keep-rate disagreements were checked and are **noise, not signal** — 47% point bigger, 53% smaller across 408 cells. A size with 15 orders at 100% will always beat one with 455 at 93%. Keep-rate columns are retained as a cross-check only.

---

## 8. ⚠️ Open issues someone must resolve

### Pomeranian data is unsafe
**9,881 pets recorded as Pomeranian against 2,464 Indian Spitz.** In India that ratio is implausible — true Poms are uncommon, Indian Spitz is everywhere. Sales also imply a **47 cm back length**, far too long for the breed (a real Pom is ~30 cm).

These are almost certainly mislabelled Indian Spitz. No Pomeranian value was changed. **Someone should check a sample of those pet profiles.** Pomeranian is the 9th biggest breed by volume, so this is not a rounding error.

### Three raincoat charts contradict themselves
**RainBuddie, RainTail Wrap, Monsoon Mate Easywear** — the "girth round minimum" row is *larger* than the middle-stage row at S–2XL. Both cannot be true. Those three are sized on back length only. **Needs the product team to confirm the correct numbers.** Already flagged in `product-specs.js` via `sourceIssue`.

### Nine breed × product combinations have no size that fits
The recommended size still comes back more than 15% of the time — the recommender is picking the best of a bad set. **Eight of nine need a size *in between* two existing ones, not a bigger one.**

| Breed | Product | Size | Keep rate | Verdict |
|---|---|---|---|---|
| **Beagle** | Sweatshirt | 2XL | 83.2% | in-between — **60 returns** |
| Pomeranian | Sweatshirt | XL | 75.0% | in-between |
| Chihuahua | Sweatshirt | S | 77.4% | in-between |
| Siberian Husky | Sweatshirt | 4XL | 81.5% | in-between |
| Indian Spitz | Sweatshirt | 2XL | 84.4% | in-between |
| Amstaff / Pit-type | Sweatshirt | 3XL | 84.8% | in-between |
| Amstaff / Pit-type | T-Shirt | 4XL | 84.9% | in-between |
| Maltese | Raincoat | M | 81.8% | in-between |
| **Bullmastiff** | Sweater | 4XL | 81.2% | **larger — top of range** |

Sweatshirt is 48 of the 67 poor-fit rows. Start there.

### Nobody who knows the products has verified any recommendation
The whole chain is one person's work — query, breed cleaning, method. **Twenty rows checked by the product team** would turn this from plausible into trusted. This has been asked for by email and WhatsApp but not yet done.

### Nobody has reviewed the SQL
`huft_fit_pull_v2.sql` has not been read by a second person. Before it drives a stocking or pattern decision, it should be.

---

## 9. Limitations to state whenever these numbers are shown

1. **Direction is known for only 34% of returns.** The rest took a refund and didn't rebuy. Those people may be the *worse* failures — someone who gives up entirely is a bigger miss than someone who swaps. If they skew any way, the real bias is **larger** than 66%, not smaller.
2. **Online volume is understated.** 16,035 online order lines against 166,789 store, because only customers with a pet profile count — and profiles are filled in far less often online. The online *rates* are sound; the online *counts* understate the channel badly.
3. **Marketplaces are invisible.** Blinkit, Zepto, Amazon, Flipkart etc. are excluded. Real pet parents buy there and we have no breed or return visibility at all.
4. **Online returns have no reason code**, so 79.5% is a store-only figure.
5. **Credit notes are not always returns.** Some are price adjustments or goodwill. Lines with zero quantity are excluded but some remain — treat online return rates as an upper bound.
6. **Breed is per household**, not per order.
7. **The cm ease figures are estimates.** Converting "83% went up" into "+2.3 cm" assumes dogs sit evenly within a size band. Direction is measured; centimetres are inferred.
8. **Two different measurement sources are now mixed.** Apparel (Raincoat, Sweater, Sweatshirt, T-Shirt, Kurta, Shirt, Sherwani — 35 models) uses the **deck size charts** in `product-specs.js`, which were read off slide images and carry a `verified` flag. Collar, Leash, Harness, Leash & Harness, Collar & Leash, Jacket, Dress and Bandana (278 products) use the **product dimensions held in Odoo**, which nobody has verified against a physical product. Every row in the workbook and every chart in the tool says which source it came from. Treat the Odoo-sourced ones as less certain until the product team checks a sample.
9. **Footwear SKUs don't parse** — different SKU convention. Shoes are unsized in this analysis.

---

## 10. How to regenerate everything

The pipeline lives in the analysis workspace, not the repo. Order:

1. Run `huft_fit_pull_v2.sql` in DBeaver → export CSV
2. `map_breeds.py` — breed spellings → clean breeds
3. `build_pairs.py` — size pair + default per breed × category
4. `keeprate` / `newsize` steps — keep rates and size-gap analysis
5. `build_sku_v2.py` / `build_final_wb.py` — the Excel outputs
6. The `fit-data.js` generator — writes the tool's data file

`product-specs.js` is **hand-maintained** and is the source of truth for garment charts. It carries `verified:true`, the source deck + slide + image hash, and `sourceIssue` flags. Anything added there must be traceable the same way.

---

## 11. Immediate next steps, in order

1. **Product team checks 20 recommendations.** Blocks trusting anything else.
2. **Confirm the 3 raincoat charts.**
3. **Check the Pomeranian profiles.**
4. **Decide on the 9 missing sizes** — mostly in-between sizes, mostly sweatshirt.
5. **Measure real dogs** — 20 per breed × top 15 breeds. Unblocks the KB and everything measurement-based.
6. **Get breed captured at online checkout.** Would take online from a tenth of the evidence to a fair share.
7. **Verify the Odoo product dimensions** for collars, leashes, harnesses, jackets and dresses against real products. These are now live in the tool and the workbook but were never checked by a human.
8. **Then step 5** — instrument the tool and measure conversion and return rate against a baseline.

---

## 12. Contacts and context

- **Gitanjali** and team — the working group on this
- **Rashi Narang** — asked whether we could build this in house after an inbound from **Mitna Mohan** at **Size n Fit**, who offered a fit-recommendation tool. Decision: build in house, since the pet measurement data tied to purchase and return outcomes is HUFT's own. A call with Size n Fit was proposed to sanity-check the approach, not to outsource it.
