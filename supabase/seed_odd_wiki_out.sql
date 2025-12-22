-- Seed data for odd_wiki_out_questions table
-- Generated from Google Sheets: wiki-guesser imposter question
-- 50 curated questions

INSERT INTO odd_wiki_out_questions (items, impostor_index, connection, wikipedia_url) VALUES
-- Apollo 11
(ARRAY['Neil Armstrong', 'Buzz Aldrin', 'Michael Collins', 'Jim Lovell'], 3, 'Armstrong, Aldrin, and Collins were the crew of Apollo 11. Jim Lovell was the commander of Apollo 13.', 'https://en.wikipedia.org/wiki/Apollo_11'),

-- The Beatles
(ARRAY['John Lennon', 'Paul McCartney', 'George Harrison', 'Mick Jagger'], 3, 'The first three were members of The Beatles. Mick Jagger is the lead singer of The Rolling Stones.', 'https://en.wikipedia.org/wiki/The_Beatles'),

-- UK Prime Ministers
(ARRAY['Margaret Thatcher', 'Tony Blair', 'Winston Churchill', 'John F. Kennedy'], 3, 'The first three were Prime Ministers of the UK. JFK was a US President.', 'https://en.wikipedia.org/wiki/List_of_prime_ministers_of_the_United_Kingdom'),

-- James Bond Actors
(ARRAY['Sean Connery', 'Roger Moore', 'Daniel Craig', 'Richard Gere'], 3, 'Connery, Moore, and Craig officially played James Bond. Richard Gere never played the role.', 'https://en.wikipedia.org/wiki/List_of_James_Bond_films'),

-- Wives of Henry VIII
(ARRAY['Anne Boleyn', 'Jane Seymour', 'Catherine of Aragon', 'Queen Victoria'], 3, 'The first three were wives of Henry VIII. Victoria was a Queen who reigned centuries later.', 'https://en.wikipedia.org/wiki/Wives_of_King_Henry_VIII'),

-- Belgian Kings
(ARRAY['Leopold I', 'Baudouin', 'Philippe', 'Charles V'], 3, 'The first three were Kings of the Belgians. Charles V was Holy Roman Emperor before Belgium existed as a country.', 'https://en.wikipedia.org/wiki/List_of_Belgian_monarchs'),

-- Impressionist Painters
(ARRAY['Claude Monet', 'Pierre-Auguste Renoir', 'Edgar Degas', 'Salvador Dalí'], 3, 'The first three are founders of Impressionism. Dalí is the icon of Surrealism.', 'https://en.wikipedia.org/wiki/Impressionism'),

-- Founders of Apple
(ARRAY['Steve Jobs', 'Steve Wozniak', 'Ronald Wayne', 'Bill Gates'], 3, 'Jobs, Wozniak, and Wayne founded Apple. Bill Gates is the founder of rival Microsoft.', 'https://en.wikipedia.org/wiki/Apple_Inc.'),

-- Friends Main Characters
(ARRAY['Rachel Green', 'Chandler Bing', 'Phoebe Buffay', 'Barney Stinson'], 3, 'The first three are characters in ''Friends''. Barney Stinson is a character from ''How I Met Your Mother''.', 'https://en.wikipedia.org/wiki/Friends'),

-- Greek Philosophers (The Big Three)
(ARRAY['Socrates', 'Plato', 'Aristotle', 'Friedrich Nietzsche'], 3, 'The first three formed the basis of classical Greek philosophy. Nietzsche was a 19th-century German philosopher.', 'https://en.wikipedia.org/wiki/Ancient_Greek_philosophy'),

-- US Presidents on Mount Rushmore
(ARRAY['George Washington', 'Thomas Jefferson', 'Theodore Roosevelt', 'John F. Kennedy'], 3, 'The first three are carved into Mount Rushmore. Kennedy is not.', 'https://en.wikipedia.org/wiki/Mount_Rushmore'),

-- Members of ABBA
(ARRAY['Agnetha Fältskog', 'Björn Ulvaeus', 'Benny Andersson', 'Céline Dion'], 3, 'The first three are members of ABBA. Céline Dion is a Canadian solo singer.', 'https://en.wikipedia.org/wiki/ABBA'),

-- American Poets
(ARRAY['Walt Whitman', 'Emily Dickinson', 'Robert Frost', 'William Shakespeare'], 3, 'The first three are famous American poets. Shakespeare was English.', 'https://en.wikipedia.org/wiki/Poetry_of_the_United_States'),

-- Hobbits in 'The Fellowship'
(ARRAY['Frodo Baggins', 'Samwise Gamgee', 'Pippin Took', 'Bilbo Baggins'], 3, 'Frodo, Sam, and Pippin were members of the Fellowship of the Ring. Bilbo did not go on that specific journey.', 'https://en.wikipedia.org/wiki/The_Lord_of_the_Rings'),

-- The Three Tenors
(ARRAY['Luciano Pavarotti', 'Plácido Domingo', 'José Carreras', 'Andrea Bocelli'], 3, 'The first three formed the commercial supergroup ''The Three Tenors''. Bocelli is a soloist.', 'https://en.wikipedia.org/wiki/The_Three_Tenors'),

-- Tour de France Winners
(ARRAY['Eddy Merckx', 'Tadej Pogačar', 'Chris Froome', 'Lance Armstrong'], 3, 'The first three are official winners. Lance Armstrong was stripped of all his titles due to doping.', 'https://en.wikipedia.org/wiki/List_of_Tour_de_France_general_classification_winners'),

-- Roman Emperors
(ARRAY['Augustus', 'Nero', 'Caligula', 'Julius Caesar'], 3, 'Augustus, Nero, and Caligula held the title of Emperor. Julius Caesar was a dictator but was assassinated before the Empire officially began.', 'https://en.wikipedia.org/wiki/List_of_Roman_emperors'),

-- Destiny's Child Members
(ARRAY['Beyoncé Knowles', 'Kelly Rowland', 'Michelle Williams', 'Rihanna'], 3, 'The first three were members of Destiny''s Child. Rihanna is a solo artist.', 'https://en.wikipedia.org/wiki/Destiny%27s_Child'),

-- Explorers of the Americas
(ARRAY['Christopher Columbus', 'Amerigo Vespucci', 'Leif Erikson', 'Marco Polo'], 3, 'The first three reached the American continent. Marco Polo traveled to Asia (China).', 'https://en.wikipedia.org/wiki/Age_of_Discovery'),

-- Harry Potter Characters (Gryffindor)
(ARRAY['Harry Potter', 'Hermione Granger', 'Ron Weasley', 'Draco Malfoy'], 3, 'The first three belong to House Gryffindor. Draco is in Slytherin.', 'https://en.wikipedia.org/wiki/Harry_Potter'),

-- Big Three (Tennis)
(ARRAY['Roger Federer', 'Rafael Nadal', 'Novak Djokovic', 'Björn Borg'], 3, 'Federer, Nadal, and Djokovic dominated 21st-century tennis. Borg was a star in the 70s/80s.', 'https://en.wikipedia.org/wiki/Big_Three_(tennis)'),

-- Dutch Golden Age Painters
(ARRAY['Rembrandt van Rijn', 'Johannes Vermeer', 'Frans Hals', 'Vincent van Gogh'], 3, 'The first three painted in the 17th century (Golden Age). Van Gogh lived in the 19th century.', 'https://en.wikipedia.org/wiki/Dutch_Golden_Age_painting'),

-- Members of Queen
(ARRAY['Freddie Mercury', 'Brian May', 'Roger Taylor', 'Elton John'], 3, 'The first three are band members of Queen. Elton John is a solo artist (though a friend of the band).', 'https://en.wikipedia.org/wiki/Queen_(band)'),

-- Renaissance Artists
(ARRAY['Leonardo da Vinci', 'Michelangelo', 'Raphael', 'Pablo Picasso'], 3, 'The first three were masters of the Renaissance. Picasso was a modern artist (Cubism).', 'https://en.wikipedia.org/wiki/Renaissance_art'),

-- Superheroes (Avengers)
(ARRAY['Iron Man', 'Thor', 'Captain America', 'Batman'], 3, 'The first three are Marvel heroes (Avengers). Batman is a DC Comics hero.', 'https://en.wikipedia.org/wiki/Avengers_(comics)'),

-- Teletubbies
(ARRAY['Tinky Winky', 'Dipsy', 'Laa-Laa', 'Big Bird'], 3, 'The first three are Teletubbies. Big Bird is a character from Sesame Street.', 'https://en.wikipedia.org/wiki/Teletubbies'),

-- French Presidents
(ARRAY['Emmanuel Macron', 'Nicolas Sarkozy', 'François Hollande', 'Boris Johnson'], 3, 'The first three were Presidents of France. Boris Johnson was Prime Minister of the UK.', 'https://en.wikipedia.org/wiki/List_of_presidents_of_France'),

-- Game of Thrones (House Stark)
(ARRAY['Arya Stark', 'Sansa Stark', 'Robb Stark', 'Joffrey Baratheon'], 3, 'The first three are children of Ned Stark. Joffrey officially belonged to House Baratheon.', 'https://en.wikipedia.org/wiki/List_of_Game_of_Thrones_characters'),

-- Classical Composers (First Viennese School)
(ARRAY['Haydn', 'Mozart', 'Beethoven', 'Elvis Presley'], 3, 'The first three are classical composers. Elvis is the King of Rock ''n Roll.', 'https://en.wikipedia.org/wiki/First_Viennese_School'),

-- Greek Olympian Gods (Brothers)
(ARRAY['Zeus', 'Poseidon', 'Hades', 'Thor'], 3, 'Zeus, Poseidon, and Hades are the three brothers who divided the world in Greek mythology. Thor is a Norse god.', 'https://en.wikipedia.org/wiki/Greek_mythology'),

-- Spider-Man Actors
(ARRAY['Tobey Maguire', 'Andrew Garfield', 'Tom Holland', 'Chris Evans'], 3, 'The first three played Spider-Man in major films. Chris Evans played Captain America.', 'https://en.wikipedia.org/wiki/Spider-Man_in_film'),

-- Physicists
(ARRAY['Albert Einstein', 'Isaac Newton', 'Niels Bohr', 'Charles Darwin'], 3, 'The first three were physicists. Charles Darwin was a biologist (Theory of Evolution).', 'https://en.wikipedia.org/wiki/Physics'),

-- Members of The Rolling Stones
(ARRAY['Mick Jagger', 'Keith Richards', 'Charlie Watts', 'Jon Bon Jovi'], 3, 'The first three are members of The Rolling Stones. Jon Bon Jovi is the singer of Bon Jovi.', 'https://en.wikipedia.org/wiki/The_Rolling_Stones'),

-- Basketball Legends
(ARRAY['Michael Jordan', 'LeBron James', 'Kobe Bryant', 'Tiger Woods'], 3, 'The first three are basketball legends. Tiger Woods is a golf legend.', 'https://en.wikipedia.org/wiki/Basketball'),

-- Star Wars Droids
(ARRAY['R2-D2', 'C-3PO', 'BB-8', 'WALL-E'], 3, 'The first three are robots from Star Wars. WALL-E is a robot from a Pixar movie.', 'https://en.wikipedia.org/wiki/Star_Wars_characters'),

-- US Late Night Hosts
(ARRAY['Jimmy Fallon', 'Stephen Colbert', 'Jay Leno', 'Dr. Phil'], 3, 'The first three are famous Late Night talk show hosts. Dr. Phil is a daytime TV psychologist.', 'https://en.wikipedia.org/wiki/Late-night_talk_show'),

-- 27 Club (Died at 27)
(ARRAY['Amy Winehouse', 'Kurt Cobain', 'Jimi Hendrix', 'Mick Jagger'], 3, 'The first three died at age 27. Mick Jagger is still alive.', 'https://en.wikipedia.org/wiki/27_Club'),

-- James Bond Villains
(ARRAY['Goldfinger', 'Blofeld', 'Le Chiffre', 'Indiana Jones'], 3, 'The first three are enemies of James Bond. Indiana Jones is an adventurer/archaeologist.', 'https://en.wikipedia.org/wiki/List_of_James_Bond_villains'),

-- Planets (Gas Giants)
(ARRAY['Jupiter', 'Saturn', 'Neptune', 'Mars'], 3, 'The first three are gas giants. Mars is a terrestrial (rocky) planet.', 'https://en.wikipedia.org/wiki/Gas_giant'),

-- Tech CEOs
(ARRAY['Mark Zuckerberg', 'Elon Musk', 'Jeff Bezos', 'Albert Einstein'], 3, 'The first three are modern tech entrepreneurs. Einstein was a scientist.', 'https://en.wikipedia.org/wiki/Big_Tech'),

-- US Presidents (Recent Democrats)
(ARRAY['Barack Obama', 'Bill Clinton', 'Joe Biden', 'George W. Bush'], 3, 'The first three are Democrats. George W. Bush is a Republican.', 'https://en.wikipedia.org/wiki/List_of_presidents_of_the_United_States'),

-- Astronomers (Renaissance)
(ARRAY['Nicolaus Copernicus', 'Galileo Galilei', 'Johannes Kepler', 'Pablo Picasso'], 3, 'The first three revolutionized astronomy. Picasso was a painter.', 'https://en.wikipedia.org/wiki/Astronomy'),

-- Surrealist Painters
(ARRAY['René Magritte', 'Salvador Dalí', 'Joan Miró', 'Peter Paul Rubens'], 3, 'The first three are surrealists. Rubens was a master of the Baroque period.', 'https://en.wikipedia.org/wiki/Surrealism'),

-- Spice Girls
(ARRAY['Victoria Beckham', 'Geri Halliwell', 'Mel B', 'Madonna'], 3, 'The first three were in the Spice Girls. Madonna is a solo artist.', 'https://en.wikipedia.org/wiki/Spice_Girls'),

-- Titanic Leads (1997 Film)
(ARRAY['Leonardo DiCaprio', 'Kate Winslet', 'Billy Zane', 'Tom Cruise'], 3, 'The first three played the main roles in Titanic (Jack, Rose, Cal). Tom Cruise was not in this movie.', 'https://en.wikipedia.org/wiki/Titanic_(1997_film)'),

-- European Capitals
(ARRAY['Paris', 'Berlin', 'Madrid', 'New York'], 3, 'The first three are capitals in Europe. New York is in the USA.', 'https://en.wikipedia.org/wiki/Europe'),

-- Fictional Candy Makers
(ARRAY['Willy Wonka', 'Oompa Loompa', 'Charlie Bucket', 'Harry Potter'], 3, 'The first three are from ''Charlie and the Chocolate Factory''. Harry Potter is a wizard.', 'https://en.wikipedia.org/wiki/Charlie_and_the_Chocolate_Factory'),

-- Members of Nirvana
(ARRAY['Kurt Cobain', 'Dave Grohl', 'Krist Novoselic', 'Axl Rose'], 3, 'The first three formed the grunge band Nirvana. Axl Rose is the singer of Guns N'' Roses.', 'https://en.wikipedia.org/wiki/Nirvana_(band)'),

-- Famous Detectives (Fiction)
(ARRAY['Sherlock Holmes', 'Hercule Poirot', 'Miss Marple', 'Darth Vader'], 3, 'The first three are famous literary detectives. Darth Vader is a Sith Lord.', 'https://en.wikipedia.org/wiki/Detective_fiction'),

-- Formula 1 World Champions
(ARRAY['Max Verstappen', 'Lewis Hamilton', 'Michael Schumacher', 'Valentino Rossi'], 3, 'The first three are Formula 1 champions. Rossi is a MotoGP legend.', 'https://en.wikipedia.org/wiki/List_of_Formula_One_World_Drivers%27_Champions');
