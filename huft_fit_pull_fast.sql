/* =====================================================================
   HUFT FIT FINDER — sales and returns pull
   Odoo 17 / PostgreSQL. READ-ONLY: creates nothing.
   WHAT IT DOES
   For every sized product bought by a customer whose pet's breed we know,
   it works out what happened:
       KEPT        the size was right
       EXCHANGED   the size was wrong, and we can see what they swapped to
       REFUNDED    the size was wrong, but we do not know which way
   Only Shopify (online) and POS (own stores). No B2B, export, quick
   commerce or marketplace — in those the buyer is a business, not a
   pet parent, so the size mix says nothing about fit.
   BEFORE RUNNING — one thing to check
   I have assumed the pet table links to the customer via
   res_partner_pet.partner_id. Confirm with:
       SELECT column_name FROM information_schema.columns
       WHERE table_name='res_partner_pet' ORDER BY ordinal_position
   If the column is named differently, change it in the "pets" block below.
   START NARROW. The date filter is set to the last 12 months. Widen it
   once you have seen it return sensible numbers.
   ===================================================================== */
WITH
/* ---- 1. breed cleaning: 701 spellings -> 71 clean breeds ---------- */
breed_clean (raw_breed, canonical) AS (
  VALUES
    ('Shih Tzu', 'Shih Tzu'),
    ('Golden Retriever', 'Golden Retriever'),
    ('Labrador', 'Labrador Retriever'),
    ('Indie Dog', 'Indian Pariah (Indie)'),
    ('Beagle', 'Beagle'),
    ('German Shepherd', 'German Shepherd'),
    ('Husky', 'Siberian Husky'),
    ('Cocker Spaniel', 'Cocker Spaniel'),
    ('Pomeranian', 'Pomeranian'),
    ('Toy Poodle', 'Toy Poodle'),
    ('LLhasa APSO', 'Lhasa Apso'),
    ('Lhasa Apso', 'Lhasa Apso'),
    ('Maltese', 'Maltese'),
    ('Rottweiler', 'Rottweiler'),
    ('pug', 'Pug'),
    ('French Bulldog', 'French Bulldog'),
    ('Doberman', 'Doberman'),
    ('Chow Chow', 'Chow Chow'),
    ('Boxer', 'Boxer'),
    ('Pitbull', 'Amstaff / Pit-type'),
    ('Chihuahua', 'Chihuahua'),
    ('Toy Pomeranian', 'Pomeranian'),
    ('Dachshund', 'Dachshund'),
    ('Yorkshire Terrier', 'Yorkshire Terrier'),
    ('German Spitz', 'German Spitz'),
    ('shihtzu', 'Shih Tzu'),
    ('American Bully', 'Amstaff / Pit-type'),
    ('Labrador Retriever', 'Labrador Retriever'),
    ('Siberian Husky', 'Siberian Husky'),
    ('indian spitz', 'Indian Spitz'),
    ('DASHUND', 'Dachshund'),
    ('spitz', 'Indian Spitz'),
    ('Great Dane', 'Great Dane'),
    ('Lasa Apso', 'Lhasa Apso'),
    ('poodle', 'Standard Poodle'),
    ('Jack Russell Terrier', 'Jack Russell Terrier'),
    ('Saint Barnard', 'Saint Bernard'),
    ('lasa', 'Lhasa Apso'),
    ('Golden retreiver', 'Golden Retriever'),
    ('Poodle (Toy)', 'Toy Poodle'),
    ('Bichon Frize', 'Bichon Frise'),
    ('Dalmatian', 'Dalmatian'),
    ('Pug', 'Pug'),
    ('Cane Corso', 'Cane Corso'),
    ('Bull Mastiff', 'Bullmastiff'),
    ('Syberian Husky', 'Siberian Husky'),
    ('English Bulldog', 'English Bulldog'),
    ('French Mastiff', 'Bullmastiff'),
    ('Corgi', 'Pembroke Corgi'),
    ('Poodle', 'Standard Poodle'),
    ('Labrador Retriever ', 'Labrador Retriever'),
    ('Akita', 'Akita'),
    ('Black Labrador', 'Labrador Retriever'),
    ('mini poodle', 'Toy Poodle'),
    ('Havanese ', 'Havanese'),
    ('Bully', 'Amstaff / Pit-type'),
    ('Indie (With Fur)', 'Indian Pariah (Indie)'),
    ('Indian Spitz', 'Indian Spitz'),
    ('Cavalier King Charles Spaniel', 'Cavalier King Charles Spaniel'),
    ('Labrator', 'Labrador Retriever'),
    ('Samoyed', 'Samoyed'),
    ('mongrul', 'Indian Pariah (Indie)'),
    ('Rajapalayam', 'Rajapalayam'),
    ('Beagle', 'Beagle'),
    ('BelgiaMalinoisn', 'Belgian Malinois'),
    ('Lab', 'Labrador Retriever'),
    ('shit tzu', 'Shih Tzu'),
    ('indie dog', 'Indian Pariah (Indie)'),
    ('miniature poodle', 'Toy Poodle'),
    ('Culture Po', 'Pomeranian'),
    ('English Retriever', 'Golden Retriever'),
    ('Pomerian', 'Pomeranian'),
    ('Border Collie', 'Border Collie'),
    ('Toy Poodle', 'Toy Poodle'),
    ('Himalayan Mastiff', 'Tibetan Mastiff'),
    ('Saint Bernard', 'Saint Bernard'),
    ('Basset Hound', 'Basset Hound'),
    ('Alaskan Malamute', 'Alaskan Malamute'),
    ('mini pom', 'Pomeranian'),
    ('Poodle (Miniature)', 'Toy Poodle'),
    ('Germen sheperd', 'German Shepherd'),
    ('St Bernard', 'Saint Bernard'),
    ('Tibetan Mastiff', 'Tibetan Mastiff'),
    ('Miniature Schnauzer', 'Miniature Schnauzer'),
    ('dogo argentino', 'Dogo Argentino'),
    ('Bull Dog', 'English Bulldog'),
    ('Chippiparai', 'Chippiparai'),
    ('american Pitbull', 'Amstaff / Pit-type'),
    ('Japanese Spitz', 'Japanese Spitz'),
    ('Indian Hound', 'Indian Pariah (Indie)'),
    ('Bhutia', 'Himalayan Sheepdog (Gaddi)'),
    ('English Mastiff', 'Bullmastiff'),
    ('Minature Pilsner', 'Miniature Pinscher'),
    ('Culture Pom', 'Pomeranian'),
    ('Australian Shepherd', 'Australian Shepherd'),
    ('British Bulldog', 'English Bulldog'),
    ('lahasa apso', 'Lhasa Apso'),
    ('Shiba Inu', 'Shiba Inu'),
    ('Irish Setter', 'Pointer / Setter'),
    ('Indie Dacshaun', 'Indian Pariah (Indie)'),
    ('Shih Apso', 'Shih Tzu'),
    ('Grey Hound', 'Greyhound / Sighthound'),
    ('Cocker Spanial', 'Cocker Spaniel'),
    ('Black German Shepherd', 'German Shepherd'),
    ('WhiteRetriver', 'Golden Retriever'),
    ('Tibetan Spaniel', 'Tibetan Spaniel'),
    ('Gaddi', 'Himalayan Sheepdog (Gaddi)'),
    ('kombai', 'Kombai'),
    ('Afghan Hound', 'Greyhound / Sighthound'),
    ('Belgian Malinois', 'Belgian Malinois'),
    ('English Cream Retriever', 'Golden Retriever'),
    ('Toypoodle', 'Toy Poodle'),
    ('Bishon', 'Bichon Frise'),
    ('Chuvava', 'Chihuahua'),
    ('Italian Mastiff', 'Bullmastiff'),
    ('Toy Poddle', 'Toy Poodle'),
    ('Pom', 'Pomeranian'),
    ('Shih -Tzu', 'Shih Tzu'),
    ('Himalayan shepherd', 'Himalayan Sheepdog (Gaddi)'),
    ('Miniature Pinscher', 'Miniature Pinscher'),
    ('American Shepherd', 'Australian Shepherd'),
    ('Weimaraner', 'Weimaraner'),
    ('Beagal', 'Beagle'),
    ('Belgium Shepherd', 'Belgian Malinois'),
    ('Staffordshire Bull Terrier', 'Amstaff / Pit-type'),
    ('American Pointer', 'Pointer / Setter'),
    ('Alsation', 'German Shepherd'),
    ('Rhodesian Ridgeback', 'Rhodesian Ridgeback'),
    ('Toy Terrier', 'Terrier (other)'),
    ('Yokshire Terrier', 'Yorkshire Terrier'),
    ('labrador', 'Labrador Retriever'),
    ('German Shorthaired Pointer', 'Pointer / Setter'),
    ('Bishop', 'Bichon Frise'),
    ('Mini Poodle', 'Toy Poodle'),
    ('Shih', 'Shih Tzu'),
    ('indie-Pom ', 'Indian Pariah (Indie)'),
    ('Black Labrator', 'Labrador Retriever'),
    ('Coton De Tulear', 'Havanese'),
    ('French bull dog', 'French Bulldog'),
    ('Shih Tzu Maltese', 'Shih Tzu'),
    ('Pekingese', 'Pekingese'),
    ('Shih - Tzu', 'Shih Tzu'),
    ('English Springer Spaniel', 'Springer Spaniel'),
    ('King Charles Spaniel', 'Cavalier King Charles Spaniel'),
    ('daschund', 'Dachshund'),
    ('German shephard', 'German Shepherd'),
    ('Lasha apso', 'Lhasa Apso'),
    ('Chaos Spaniel', 'Cocker Spaniel'),
    ('Huskty', 'Siberian Husky'),
    ('Miniature Dachshund', 'Dachshund'),
    ('POODLE', 'Standard Poodle'),
    ('tIBETIAN TERRIER', 'Tibetan Terrier'),
    ('pikinis', 'Pug'),
    ('Mongrel', 'Indian Pariah (Indie)'),
    ('bully kutta', 'Bully Kutta (Indian Mastiff)'),
    ('lash apso', 'Lhasa Apso'),
    ('Indie-Pom', 'Indian Pariah (Indie)'),
    ('Terrier', 'Terrier (other)'),
    ('Toy Maltese', 'Maltese'),
    ('Miniature pinscher', 'Miniature Pinscher'),
    ('mini maltese', 'Maltese'),
    ('Havanese', 'Havanese'),
    ('American Staffordshire Terrier', 'Amstaff / Pit-type'),
    ('Muthoot Hound', 'Indian Pariah (Indie)'),
    ('Bichon Frise', 'Bichon Frise'),
    ('goloden retriver', 'Golden Retriever'),
    ('Mastiff', 'Bullmastiff'),
    ('white retriever', 'Golden Retriever'),
    ('toy fOX terrier', 'Terrier (other)'),
    ('cooker spaniel', 'Cocker Spaniel'),
    ('American Akita ', 'Akita'),
    ('Poodle', 'Standard Poodle'),
    ('caravan hound', 'Mudhol / Caravan Hound'),
    ('Tibetan Terrier', 'Tibetan Terrier'),
    ('Fox Terrier', 'Terrier (other)'),
    ('Chauchau', 'Chow Chow'),
    ('Mudhol Hound', 'Mudhol / Caravan Hound'),
    ('Jack Mals', 'Jack Russell Terrier'),
    ('SHITZU', 'Shih Tzu'),
    ('Alsatian', 'German Shepherd'),
    ('Jack Russel Te', 'Jack Russell Terrier'),
    ('Shih-tzu', 'Shih Tzu'),
    ('Australian Cattle Dog', 'Australian Cattle Dog'),
    ('Miniature Poodle', 'Toy Poodle'),
    ('Lhasa APSO', 'Lhasa Apso'),
    ('Golden RETRIVER', 'Golden Retriever'),
    ('Miniature Spitz', 'Indian Spitz'),
    ('german shephert', 'German Shepherd'),
    ('Whippet', 'Greyhound / Sighthound'),
    ('Nepolian mastif', 'Bullmastiff'),
    ('rotweiler', 'Rottweiler'),
    ('Cocor spenial', 'Cocker Spaniel'),
    ('Indian gaddi', 'Himalayan Sheepdog (Gaddi)'),
    ('new found land', 'Saint Bernard'),
    ('Pandikona', 'Pandikona'),
    ('-Dalmation', 'Dalmatian'),
    ('Black German Sepherd', 'German Shepherd'),
    ('Havenese', 'Havanese'),
    ('Cairn Terrier', 'Terrier (other)'),
    ('schnauzer', 'Miniature Schnauzer'),
    ('Pariah', 'Indian Pariah (Indie)'),
    ('Newfoundland', 'Saint Bernard'),
    ('indie pom mi', 'Indian Pariah (Indie)'),
    ('Yorkie', 'Yorkshire Terrier'),
    ('cane', 'Cane Corso'),
    ('cockerspaniel', 'Cocker Spaniel'),
    ('Chiuaua', 'Chihuahua'),
    ('German shepherds', 'German Shepherd'),
    ('Chow chw', 'Chow Chow'),
    ('Dobber man', 'Doberman'),
    ('New Foundland', 'Saint Bernard'),
    ('Belgian Shepherd', 'Belgian Malinois'),
    ('belgian mastiff', 'Bullmastiff'),
    ('Papillon', 'Papillon'),
    ('Collie', 'Border Collie'),
    ('pignese', 'Pug'),
    ('Airedale Terrier', 'Terrier (other)'),
    ('SHih ztu', 'Shih Tzu'),
    ('Lab-German', 'Labrador Retriever'),
    ('dober', 'Doberman'),
    ('Teacup Yorkie', 'Yorkshire Terrier'),
    ('Maltisse', 'Maltese'),
    ('GermanSepherdMixRottweiler', 'Rottweiler'),
    ('Lab - German ', 'Labrador Retriever'),
    ('Mini Poddle', 'Toy Poodle'),
    ('West Highland White Terrier', 'Terrier (other)'),
    ('Westie Terrier', 'Terrier (other)'),
    ('great pyranese ', 'Great Pyrenees'),
    ('American eskimo', 'Indian Spitz'),
    ('Chowchow', 'Chow Chow'),
    ('belgian sepherd', 'Belgian Malinois'),
    ('indian terrier', 'Terrier (other)'),
    ('french', 'French Bulldog'),
    ('Rottweiler (nt cooperte wth othr pets)', 'Rottweiler'),
    ('King sheperd', 'German Shepherd'),
    ('minpin', 'Miniature Pinscher'),
    ('Long Haired Dachshund', 'Dachshund'),
    ('Black Retriever', 'Golden Retriever'),
    ('Shi-Tzu', 'Shih Tzu'),
    ('Korean spitz', 'Indian Spitz'),
    ('Eskimo', 'Indian Spitz'),
    ('indie Husky', 'Indian Pariah (Indie)'),
    ('Dogo argentino', 'Dogo Argentino'),
    ('St. Bernard', 'Saint Bernard'),
    ('sant bernat', 'Saint Bernard'),
    ('rampur hound ', 'Rampur Greyhound'),
    ('puli', 'Other pedigree'),
    ('Indie Spitz', 'Indian Pariah (Indie)'),
    (' Black Retriever', 'Golden Retriever'),
    ('Chiwawa', 'Chihuahua'),
    ('indian paraya', 'Indian Pariah (Indie)'),
    ('Ruff kolly', 'Border Collie'),
    ('Belgian Shephard', 'Belgian Malinois'),
    ('vizsla', 'Pointer / Setter'),
    ('Pariha', 'Indian Pariah (Indie)'),
    ('Norfolk Terrier', 'Terrier (other)'),
    ('Doberman pincher European', 'Doberman'),
    ('Scottish terrier', 'Terrier (other)'),
    ('Beagle Husky', 'Beagle'),
    ('bedlington terrier', 'Terrier (other)'),
    ('cain corso', 'Cane Corso'),
    ('cocker pug', 'Cocker Spaniel'),
    ('indie long coat', 'Indian Pariah (Indie)'),
    ('Irish labrador', 'Labrador Retriever'),
    ('Irish Terrier', 'Terrier (other)'),
    ('Golden Retrievereng', 'Golden Retriever'),
    ('Indie Dachshund', 'Indian Pariah (Indie)'),
    ('Keeshond', 'Other pedigree'),
    ('elkhound', 'Other pedigree'),
    ('Labrador [8 year]', 'Labrador Retriever'),
    ('Cardigan Welsh Corgi', 'Pembroke Corgi'),
    ('Yorkshire biewer', 'Yorkshire Terrier'),
    ('lesepso', 'Lhasa Apso'),
    ('Cocker Spaiel', 'Cocker Spaniel'),
    ('Cocker Spaniel ( 9 years)', 'Cocker Spaniel'),
    ('Lhasaa', 'Lhasa Apso'),
    ('English Pointer', 'Pointer / Setter'),
    ('Great Pyrenees', 'Great Pyrenees'),
    ('Portuguese water dog', 'Other pedigree'),
    ('samo', 'Samoyed'),
    ('Old English Sheepdog', 'Other pedigree'),
    ('Tatra Shepherd Dog ', 'Other pedigree'),
    ('Short hair Havanese', 'Havanese'),
    ('Tibetan Apso', 'Lhasa Apso'),
    ('Sheba Inu', 'Shiba Inu'),
    ('pikaso pablo', 'Pekingese'),
    ('Giant Poodle', 'Standard Poodle'),
    ('Borzoi', 'Greyhound / Sighthound'),
    ('White  Terrier', 'Terrier (other)'),
    ('Border Terrier', 'Terrier (other)'),
    ('Basenji', 'Other pedigree'),
    ('Boston Terrier', 'English Bulldog'),
    ('cocke', 'Cocker Spaniel'),
    ('Golden pome', 'Pomeranian'),
    ('pitbull terrier', 'Amstaff / Pit-type'),
    ('toy beagle', 'Beagle'),
    ('GSD puppy', 'German Shepherd'),
    ('Anatolian Shepherd', 'Other pedigree'),
    ('kangal', 'Other pedigree'),
    ('Afganistan Haund', 'Greyhound / Sighthound'),
    ('Antolian shepherd', 'Other pedigree'),
    ('peengese', 'Pekingese'),
    ('Dober mann', 'Doberman'),
    ('tibetian Spaniel', 'Tibetan Spaniel'),
    ('Iindian Hound', 'Indian Pariah (Indie)'),
    ('pyranese pit', 'Great Pyrenees'),
    ('Pikinis', 'Pug'),
    ('Toy Beagle', 'Beagle'),
    ('Japanies Akita', 'Akita'),
    ('Agouti Husky', 'Siberian Husky'),
    ('mini pinshecir', 'Miniature Pinscher'),
    ('pocket bully', 'Amstaff / Pit-type'),
    ('INDI GERMAN SHEPERD', 'German Shepherd'),
    ('Amrican husky', 'Siberian Husky'),
    ('australian silky terrier', 'Terrier (other)'),
    ('Bull Terrier', 'Terrier (other)'),
    ('AUSTRALIAN KELPIE', 'Australian Cattle Dog'),
    ('Vizsla', 'Pointer / Setter'),
    ('Tatra Shepherd Dog', 'Other pedigree'),
    ('Yorkshire teacup', 'Yorkshire Terrier'),
    ('Gordon setter', 'Pointer / Setter'),
    ('Sant bernat', 'Saint Bernard'),
    ('Sant Bernat', 'Saint Bernard'),
    ('grey ghost', 'Weimaraner'),
    ('Italian Greyhound', 'Greyhound / Sighthound'),
    ('German Shepherd [12.5year]', 'German Shepherd'),
    ('moltis', 'Maltese'),
    ('Dalmatian-Labrador', 'Labrador Retriever'),
    ('Briard', 'Other pedigree'),
    ('Liver Shepherd', 'German Shepherd'),
    ('london terrier', 'Terrier (other)'),
    ('Shetland', 'Other pedigree'),
    ('Panda chow chow', 'Chow Chow'),
    ('Chi', 'Chihuahua'),
    ('Pyrenees Pit', 'Great Pyrenees'),
    ('Arabian Malinois', 'Belgian Malinois'),
    ('Neapolitan Mastiff', 'Bullmastiff'),
    ('highland terrier', 'Terrier (other)'),
    ('Bostain Terrier', 'English Bulldog'),
    ('Indian Mongrels', 'Indian Pariah (Indie)'),
    ('Yorkshire Terrier Dog breed', 'Yorkshire Terrier'),
    ('Biewer', 'Yorkshire Terrier'),
    ('Shih Tzu with Ashang', 'Shih Tzu'),
    ('Shih Tzu(Kaushik)', 'Shih Tzu'),
    ('shetland sheepdog', 'Other pedigree'),
    ('Shar Pei', 'Shar Pei'),
    ('Boerboel', 'Other pedigree'),
    ('maltier', 'Maltese'),
    ('Chlocholate Labrador', 'Labrador Retriever')
),
/* ---- 2. the size ladder, so we can tell up from down -------------- */
size_rank (size_label, rank) AS (
  VALUES ('2XS',0),('XXS',0),('XS',2),('XS/S',3),('S',4),('S/M',5),('M',6),
         ('M/L',7),('L',8),('L/XL',9),('XL',10),('XL/2XL',11),('XXL',12),
         ('2XL',12),('3XL',13),('4XL',14),('5XL',15),('6XL',16),('7XL',17),
         ('SMALL',4),('MEDIUM',6),('LARGE',8),('EXTRA LARGE',10)
),
/* ---- 3. what counts as a sized, in-scope product ------------------
   This database was migrated, and the variant-to-attribute links did not
   survive: product_variant_combination is empty, combination_indices is
   empty, and the order-line attribute links are empty too. So size is
   read from the SKU suffix, which every variant has.
   Checked before use: Clothing parses at 91.6% with a full ladder
   (2XS to 7XL), while Food and Treats parse at 0% — the regex is not
   inventing sizes where none exist.
   Categories are an ALLOW list, not a deny list. Pet Toys and packaging
   parse a few percent by accident, and those would be false sizes.     */
sized AS MATERIALIZED (
    SELECT pp.id                                            AS product_id,
           pt.id                                            AS template_id,
           coalesce(to_jsonb(pt.name)->>'en_US', pt.name::text) AS product_name,
           pc.complete_name                                 AS category,
           split_part(pc.complete_name, ' / ', 1)           AS category_l1,
           split_part(pc.complete_name, ' / ', 2)           AS category_l2,
           regexp_replace(upper(trim(pp.default_code)),
             '(2XS|XXS|XXL|7XL|6XL|5XL|4XL|3XL|2XL|XS|XL|S|M|L)$','') AS base_sku,
           (regexp_match(upper(trim(pp.default_code)),
             '(2XS|XXS|XXL|7XL|6XL|5XL|4XL|3XL|2XL|XS|XL|S|M|L)$'))[1] AS size_label
    FROM product_product pp
    JOIN product_template pt  ON pt.id = pp.product_tmpl_id
    JOIN product_category  pc ON pc.id = pt.categ_id
    WHERE coalesce(pp.default_code,'') <> ''
      AND coalesce(pp.active, true)
      AND split_part(pc.complete_name, ' / ', 1) IN
          ('Clothing', 'Collars, Leashes & Harnesses', 'Accessories', 'Footwear')
      AND (regexp_match(upper(trim(pp.default_code)),
            '(2XS|XXS|XXL|7XL|6XL|5XL|4XL|3XL|2XL|XS|XL|S|M|L)$'))[1] IS NOT NULL
),
/* ---- 4. one breed per customer, plus date of birth ----------------
   partner_id IS the customer id — in Odoo the customer lives in
   res_partner, and this is the pointer to it. Same field as
   sale_order.partner_id and pos_order.partner_id.
   Inactive pet records are dropped: they are usually duplicates or
   pets that have passed away, and should not drive sizing.          */
pets AS MATERIALIZED (
    SELECT p.partner_id,
           min(bc.canonical)                                 AS breed,
           min(p.birthday)                                   AS birthday,
           count(*)                                          AS pets_on_profile
    FROM res_partner_pet p
    LEFT JOIN pet_breed b   ON b.id = p.breed
    LEFT JOIN breed_clean bc
           ON bc.raw_breed = coalesce(to_jsonb(b.name)->>'en_US', b.name::text)
    WHERE bc.canonical IS NOT NULL
      AND coalesce(p.active, true)
    GROUP BY p.partner_id
),
/* ---- 5. order lines: Shopify online + POS stores ------------------ */
lines AS MATERIALIZED (
    SELECT 'Shopify'::text        AS channel,
           so.id                  AS order_id,
           sol.id                 AS line_id,
           so.date_order::date    AS order_date,
           so.partner_id,
           sol.product_id,
           sol.product_uom_qty    AS qty
    FROM sale_order so
    JOIN sale_order_line sol ON sol.order_id = so.id
    WHERE so.shopify_instance_id IS NOT NULL
      AND so.state IN ('sale','done')
      AND so.date_order >= (CURRENT_DATE - INTERVAL '12 months')
      AND EXISTS (SELECT 1 FROM sized s  WHERE s.product_id  = sol.product_id)
      AND EXISTS (SELECT 1 FROM pets  pe WHERE pe.partner_id = so.partner_id)
    UNION ALL
    SELECT 'POS'::text,
           po.id,
           pol.id,
           po.date_order::date,
           po.partner_id,
           pol.product_id,
           pol.qty
    FROM pos_order po
    JOIN pos_order_line pol ON pol.order_id = po.id
    WHERE po.state IN ('paid','done','invoiced')
      AND po.date_order >= (CURRENT_DATE - INTERVAL '12 months')
      AND pol.qty > 0
      AND EXISTS (SELECT 1 FROM sized s  WHERE s.product_id  = pol.product_id)
      AND EXISTS (SELECT 1 FROM pets  pe WHERE pe.partner_id = po.partner_id)
),
/* ---- 6. customer-initiated returns, completed only ---------------- */
returns AS MATERIALIZED (
    SELECT orpl.so_line_id,
           orpl.pos_order_line_id,
           orr.return_date,
           orr.id                                            AS return_request_id,
           coalesce(to_jsonb(rr.name)->>'en_US', rr.name::text) AS reason,
           lower(trim(coalesce(to_jsonb(rr.name)->>'en_US', rr.name::text))) AS reason_key
    FROM order_return_request orr
    JOIN order_return_product_line orpl ON orpl.return_id = orr.id
    LEFT JOIN return_reason rr          ON rr.id = orpl.return_reason_id
    WHERE orr.request_type = 'cir'          -- customer initiated, not courier failure
      AND orr.status = 'done'
      AND orpl.returned_quantity > 0
),
/* ---- 7. put it together ------------------------------------------ */
base AS MATERIALIZED (
    SELECT l.channel,
           l.order_id,
           l.line_id,
           l.order_date,
           l.partner_id,
           pe.breed,
           pe.pets_on_profile,
           pe.birthday,
           /* age in months at the moment of purchase. A growing dog buys
              the size that fits it today, not its adult size, so puppy
              orders would drag every breed smaller if counted as adult
              evidence. Flagged rather than dropped, so we can test it.  */
           CASE WHEN pe.birthday IS NULL THEN NULL
                ELSE floor(extract(epoch FROM age(l.order_date, pe.birthday))/2629800)
           END                                        AS age_months_at_order,
           CASE WHEN pe.birthday IS NULL THEN 'unknown'
                WHEN age(l.order_date, pe.birthday) < INTERVAL '12 months' THEN 'puppy'
                ELSE 'adult' END                      AS life_stage,
           s.template_id,
           s.base_sku,
           s.product_name,
           s.category_l1,
           s.category_l2,
           s.size_label,
           sr.rank                                    AS size_rank,
           l.qty,
           r.reason_key,
           r.return_date,
           CASE WHEN r.so_line_id IS NULL AND r.pos_order_line_id IS NULL
                THEN 'KEPT' ELSE 'RETURNED' END       AS outcome
    FROM lines l
    JOIN sized s   ON s.product_id = l.product_id
    JOIN pets  pe  ON pe.partner_id = l.partner_id
    LEFT JOIN size_rank sr ON sr.size_label = s.size_label
    LEFT JOIN returns r
           ON (l.channel = 'Shopify' AND r.so_line_id        = l.line_id)
           OR (l.channel = 'POS'     AND r.pos_order_line_id = l.line_id)
),
/* ---- 8. exchanges: did they rebuy the SAME product, DIFFERENT size? */
swap AS MATERIALIZED (
    /* ONE row per returned line — the closest rebuy in time.
       Without DISTINCT ON, a customer who bought the same product in
       three sizes multiplies that return into three rows, inflating
       every count downstream. */
    SELECT DISTINCT ON (b.line_id)
           b.line_id,
           b2.size_label                              AS swapped_to_size,
           b2.size_rank                               AS swapped_to_rank
    FROM base b
    JOIN base b2
      ON  b2.partner_id  = b.partner_id
      AND b2.partner_id IN (SELECT partner_id FROM base WHERE outcome = 'RETURNED')
      AND b2.base_sku    = b.base_sku
      AND b2.size_label <> b.size_label
      AND b2.order_date BETWEEN b.return_date - INTERVAL '30 days'
                            AND b.return_date + INTERVAL '60 days'
      AND b2.outcome = 'KEPT'
    WHERE b.outcome = 'RETURNED'
    ORDER BY b.line_id, abs(b2.order_date - b.return_date)
)
/* =====================================================================
   OUTPUT — one row per breed / category / size, with what happened.
   This is the export.
   ===================================================================== */
SELECT b.breed,
       b.category_l1                                        AS category,
       b.category_l2                                        AS sub_category,
       b.size_label                                         AS size,
       count(*)                                             AS orders,
       count(*) FILTER (WHERE b.outcome = 'KEPT')           AS kept,
       count(*) FILTER (WHERE b.outcome = 'RETURNED')       AS returned,
       count(*) FILTER (WHERE b.reason_key LIKE '%size%')   AS returned_size_reason,
       count(sw.line_id)                                    AS exchanged,
       count(*) FILTER (WHERE sw.swapped_to_rank > b.size_rank) AS swapped_bigger,
       count(*) FILTER (WHERE sw.swapped_to_rank < b.size_rank) AS swapped_smaller,
       count(*) FILTER (WHERE b.pets_on_profile = 1)        AS single_pet_orders,
       count(*) FILTER (WHERE b.life_stage = 'adult')       AS adult_orders,
       count(*) FILTER (WHERE b.life_stage = 'puppy')       AS puppy_orders,
       count(*) FILTER (WHERE b.life_stage = 'unknown')     AS unknown_age_orders,
       round(100.0 * count(*) FILTER (WHERE b.outcome = 'KEPT' AND b.life_stage = 'adult')
             / nullif(count(*) FILTER (WHERE b.life_stage = 'adult'),0), 1) AS kept_pct_adults,
       round(100.0 * count(*) FILTER (WHERE b.outcome = 'KEPT') / count(*), 1) AS kept_pct
FROM base b
LEFT JOIN swap sw ON sw.line_id = b.line_id
GROUP BY 1,2,3,4
HAVING count(*) >= 5
ORDER BY b.breed, b.category_l1, b.category_l2, min(b.size_rank);
