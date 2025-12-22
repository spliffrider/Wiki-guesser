-- Seed data for all question categories
-- Run this in Supabase SQL Editor

-- ============================================================================
-- WHEN IN WIKI (Year guessing)
-- ============================================================================
INSERT INTO when_in_wiki_questions (event, correct_year, year_options, wikipedia_url) VALUES
('The first moon landing occurred', 1969, ARRAY[1969, 1965, 1972, 1959], 'https://en.wikipedia.org/wiki/Apollo_11'),
('The fall of the Berlin Wall', 1989, ARRAY[1989, 1987, 1991, 1985], 'https://en.wikipedia.org/wiki/Fall_of_the_Berlin_Wall'),
('Discovery of America by Christopher Columbus', 1492, ARRAY[1492, 1488, 1496, 1502], 'https://en.wikipedia.org/wiki/Voyages_of_Christopher_Columbus'),
('The sinking of the Titanic', 1912, ARRAY[1912, 1905, 1918, 1923], 'https://en.wikipedia.org/wiki/Sinking_of_the_Titanic'),
('World War I began', 1914, ARRAY[1914, 1912, 1916, 1910], 'https://en.wikipedia.org/wiki/World_War_I'),
('The French Revolution started', 1789, ARRAY[1789, 1776, 1799, 1804], 'https://en.wikipedia.org/wiki/French_Revolution'),
('The first iPhone was released', 2007, ARRAY[2007, 2005, 2009, 2010], 'https://en.wikipedia.org/wiki/IPhone'),
('Nelson Mandela was released from prison', 1990, ARRAY[1990, 1988, 1994, 1986], 'https://en.wikipedia.org/wiki/Nelson_Mandela'),
('The Chernobyl disaster occurred', 1986, ARRAY[1986, 1984, 1988, 1991], 'https://en.wikipedia.org/wiki/Chernobyl_disaster'),
('The first Harry Potter book was published', 1997, ARRAY[1997, 1995, 1999, 2001], 'https://en.wikipedia.org/wiki/Harry_Potter_and_the_Philosopher%27s_Stone');

-- ============================================================================
-- WIKI OR FICTION (True/False)
-- ============================================================================
INSERT INTO wiki_or_fiction_questions (statement, is_true, explanation, wikipedia_url) VALUES
('Honey never spoils. Archaeologists have found 3000-year-old honey in Egyptian tombs that was still edible.', true, 'Honey''s low moisture content and acidic pH create an inhospitable environment for bacteria and microorganisms.', 'https://en.wikipedia.org/wiki/Honey'),
('Goldfish have a memory span of only three seconds.', false, 'This is a myth. Goldfish can actually remember things for months and can be trained to respond to signals.', 'https://en.wikipedia.org/wiki/Goldfish'),
('The Great Wall of China is visible from space with the naked eye.', false, 'This is a common misconception. The wall is too narrow to be seen from orbit without aid.', 'https://en.wikipedia.org/wiki/Great_Wall_of_China'),
('Octopuses have three hearts.', true, 'Two branchial hearts pump blood through the gills, while a systemic heart pumps it through the body.', 'https://en.wikipedia.org/wiki/Octopus'),
('Humans only use 10% of their brain.', false, 'Brain imaging shows that all parts of the brain have known functions and are active at different times.', 'https://en.wikipedia.org/wiki/Ten_percent_of_the_brain_myth'),
('Bananas are berries, but strawberries are not.', true, 'Botanically, bananas qualify as berries while strawberries are "accessory fruits."', 'https://en.wikipedia.org/wiki/Berry_(botany)'),
('Vikings wore horned helmets.', false, 'There is no historical evidence that Vikings wore horned helmets in battle. This is a 19th-century romanticization.', 'https://en.wikipedia.org/wiki/Horned_helmet'),
('Cleopatra lived closer in time to the Moon landing than to the construction of the Great Pyramid.', true, 'The Great Pyramid was built around 2560 BCE. Cleopatra lived around 30 BCE, and the Moon landing was 1969 CE.', 'https://en.wikipedia.org/wiki/Cleopatra'),
('Lightning never strikes the same place twice.', false, 'Lightning frequently strikes the same location, especially tall structures like the Empire State Building.', 'https://en.wikipedia.org/wiki/Lightning'),
('A day on Venus is longer than a year on Venus.', true, 'Venus rotates so slowly that one day (243 Earth days) is longer than its orbital period (225 Earth days).', 'https://en.wikipedia.org/wiki/Venus');

-- ============================================================================
-- WIKI LINKS (What connects these?)
-- ============================================================================
INSERT INTO wiki_links_questions (titles, connection, connection_options, wikipedia_url) VALUES
(ARRAY['Albert Einstein', 'Isaac Newton', 'Niels Bohr', 'Stephen Hawking'], 'Famous Physicists', ARRAY['Famous Physicists', 'Nobel Prize Winners', 'British Scientists', 'Mathematicians'], 'https://en.wikipedia.org/wiki/Physics'),
(ARRAY['Paris', 'Berlin', 'Rome', 'Madrid'], 'European Capital Cities', ARRAY['European Capital Cities', 'Cities with Rivers', 'Olympic Host Cities', 'UNESCO Heritage Sites'], 'https://en.wikipedia.org/wiki/Capital_city'),
(ARRAY['Lion', 'Tiger', 'Leopard', 'Jaguar'], 'Big Cats (Panthera genus)', ARRAY['Big Cats (Panthera genus)', 'African Animals', 'Endangered Species', 'Apex Predators'], 'https://en.wikipedia.org/wiki/Panthera'),
(ARRAY['Amazon', 'Netflix', 'Spotify', 'Disney+'], 'Subscription Streaming Services', ARRAY['Subscription Streaming Services', 'American Companies', 'Tech Giants', 'Entertainment Brands'], 'https://en.wikipedia.org/wiki/Streaming_media'),
(ARRAY['Mercury', 'Venus', 'Earth', 'Mars'], 'Terrestrial (Rocky) Planets', ARRAY['Terrestrial (Rocky) Planets', 'Inner Solar System', 'Planets with Moons', 'Planets Discovered by Galileo'], 'https://en.wikipedia.org/wiki/Terrestrial_planet'),
(ARRAY['Mona Lisa', 'The Last Supper', 'Vitruvian Man', 'Lady with an Ermine'], 'Works by Leonardo da Vinci', ARRAY['Works by Leonardo da Vinci', 'Renaissance Paintings', 'Art in Italy', 'Portraits'], 'https://en.wikipedia.org/wiki/Leonardo_da_Vinci'),
(ARRAY['Bitcoin', 'Ethereum', 'Dogecoin', 'Litecoin'], 'Cryptocurrencies', ARRAY['Cryptocurrencies', 'Blockchain Technologies', 'Digital Payment Methods', 'Investment Assets'], 'https://en.wikipedia.org/wiki/Cryptocurrency'),
(ARRAY['Hamlet', 'Macbeth', 'Othello', 'King Lear'], 'Shakespeare Tragedies', ARRAY['Shakespeare Tragedies', 'British Plays', 'Stories Set in Europe', 'Works Adapted to Film'], 'https://en.wikipedia.org/wiki/Shakespearean_tragedy'),
(ARRAY['Oxygen', 'Nitrogen', 'Argon', 'Carbon Dioxide'], 'Gases in Earth''s Atmosphere', ARRAY['Gases in Earth''s Atmosphere', 'Noble Gases', 'Colorless Gases', 'Elements on Periodic Table'], 'https://en.wikipedia.org/wiki/Atmosphere_of_Earth'),
(ARRAY['Taj Mahal', 'Machu Picchu', 'Colosseum', 'Petra'], 'New Seven Wonders of the World', ARRAY['New Seven Wonders of the World', 'UNESCO World Heritage Sites', 'Ancient Monuments', 'Tourist Attractions'], 'https://en.wikipedia.org/wiki/New7Wonders_of_the_World');
