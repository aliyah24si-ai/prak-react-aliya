-- ============================================================
-- SEED DATA: products
-- Run AFTER schema.sql has been executed successfully
-- ============================================================

INSERT INTO products (name, description, price, stock, is_active) VALUES
  ('Essence Mascara Lash Princess',       'Beauty - Essence',               9990,     40,  TRUE),
  ('Eyeshadow Palette with Mirror',       'Beauty - Glamour Beauty',       19990,     60,  TRUE),
  ('Powder Canister',                     'Beauty - Velvet Touch',          14990,     75,  TRUE),
  ('Red Lipstick',                        'Beauty - Chic Cosmetics',        12990,     35,  TRUE),
  ('Red Nail Polish',                     'Beauty - Nail Couture',           8990,     50,  TRUE),
  ('Calvin Klein CK One',                 'Fragrances - Calvin Klein',      49990,     30,  TRUE),
  ('Chanel Coco Noir Eau De',            'Fragrances - Chanel',           129990,     20,  TRUE),
  ('Dior J''adore',                       'Fragrances - Dior',              89990,     25,  TRUE),
  ('Dolce Shine Eau De',                 'Fragrances - Dolce & Gabbana',   69990,     18,  TRUE),
  ('Gucci Bloom Eau De',                 'Fragrances - Gucci',             79990,     22,  TRUE),
  ('Annibale Colombo Bed',               'Furniture - Annibale Colombo',  1899990,    10,  TRUE),
  ('Annibale Colombo Sofa',              'Furniture - Annibale Colombo',  2499990,     8,  TRUE),
  ('Annibale Colombo Sofa Premium',      'Furniture - Annibale Colombo',  2499990,     6,  TRUE),
  ('Knoll Saarinen Conference Chair',    'Furniture - Knoll',              499990,    15,  TRUE),
  ('Wooden Bathroom Sink With Mirror',   'Furniture - Bathroom Essentials',799990,    12,  TRUE),
  ('Apple',                               'Groceries - Fresh Harvest',      19990,    100,  TRUE),
  ('Beef Steak',                          'Groceries - Prime Cuts',        129990,     40,  TRUE),
  ('Cat Food - Dry',                      'Groceries - Whisker Delight',    39990,     60,  TRUE),
  ('Chicken Meat',                        'Groceries - Farm Fresh',         49990,     55,  TRUE),
  ('Cooking Oil',                         'Groceries - Golden Chef',        24990,     80,  TRUE),
  ('Cucumber',                            'Groceries - Fresh Harvest',       9990,     90,  TRUE),
  ('Dog Food',                            'Groceries - Paws & Claws',       44990,     50,  TRUE),
  ('Eggs',                                'Groceries - Farm Fresh',         29990,    120,  TRUE),
  ('Fish Steak',                          'Groceries - Ocean Catch',        59990,     35,  TRUE),
  ('Green Bell Pepper',                   'Groceries - Fresh Harvest',      12990,     75,  TRUE),
  ('Green Chili Pepper',                  'Groceries - Fresh Harvest',       9990,     85,  TRUE),
  ('Honey Jar',                           'Groceries - Nature''s Gold',     34990,     45,  TRUE),
  ('Ice Cream',                           'Groceries - Chill Zone',         19990,     60,  TRUE),
  ('Juice',                               'Groceries - Fruity Fresh',       14990,     70,  TRUE),
  ('Kiwi',                                'Groceries - Fresh Harvest',      24990,     55,  TRUE);
