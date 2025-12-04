-- Poblar tabla movies con películas reales populares
INSERT INTO movies (tmdb_id, title, original_title, overview, poster_path, backdrop_path, release_date, vote_average, vote_count, popularity, genre_ids, revenue, runtime, status, tagline) VALUES
(550, 'Fight Club', 'Fight Club', 'A ticking-time-bomb insomniac and a devil-may-care soapmaker form an underground fight club that evolves into much more.', '/pB8BM7pdSp6B6Ih7QZ5BXUKCJhm.jpg', '/hZkgoQYUs5bNOtskFPSDd91kQ7d.jpg', '1999-10-15', 8.8, 24830, 85.5, '18,28', 100853753, 139, 'Released', 'How much can you know about yourself you never been in a fight'),
(278, 'The Shawshank Redemption', 'The Shawshank Redemption', 'Framed in the 1940s for the double murder of his wife and her lover, upstanding banker Andy Dufresne begins a new life at the Shawshank prison', '/q6725aR8Zs4IwGxzz4Ia5feAtm.jpg', '/A62tIvwJjYFApAtMTvnMViXHeHd.jpg', '1994-09-23', 9.3, 28326, 92.3, '18,80', 0, 142, 'Released', 'Fear can hold you prisoner. Hope can set you free.'),
(27205, 'Inception', 'Inception', 'Cobb, a skilled thief who commits corporate espionage by infiltrating the subconscious of his targets is offered a chance to regain his old life', '/img4gPgP5eKTjWltPCRCs9rzq4O.jpg', '/s3TBrffO3aoJT7gO6AJ+tsAuNXi.jpg', '2010-07-16', 8.8, 34664, 83.5, '28,12,18', 839671789, 148, 'Released', 'Your mind is the scene of the crime'),
(238, 'The Godfather', 'Il Padrino', 'Spanning the years 1945 to 1955, a chronicle of the fictional Italian-American Mafia dynasty', '/3bhkrj58Vtu7enYsRolD1fmnIzr.jpg', '/bX2xNeTbIH0DtqFuA51fT3nMrO5.jpg', '1972-03-14', 9.2, 19221, 82.2, '18,80', 245066411, 175, 'Released', 'An offer you can\''t refuse.'),
(278, 'The Dark Knight', 'The Dark Knight', 'When the menace known as the Joker wreaks havoc and chaos on the people of Gotham, Batman must accept one of the greatest tests', '/1hf3q6K7BUx0U7h4O2wKqGWlCz6.jpg', '/l25UXT011KYYkEQynCPlanCbHop.jpg', '2008-07-18', 9.0, 29410, 85.2, '28,12,18', 1005064711, 152, 'Released', 'Welcome to a world without rules'),
(240, 'The Godfather Part II', 'Il Padrino - Parte II', 'The continuing saga of the Corleone crime dynasty', '/tHbMIcNrqsIlPZIpo50amCFDIDT.jpg', '/p8dyx9xjDCOrhxGSXpXgKpWqXxV.jpg', '1974-12-12', 9.0, 14533, 80.5, '18,80', 93000000, 202, 'Released', 'The saga continues'),
(424, 'Schindler\'s List', 'Schindler\'s List', 'In German-occupied Poland during World War II, industrialist Oskar Schindler gradually becomes concerned for his workforce', '/sF1U4EUQS8YHUcO87ohn3G8CU21.jpg', '/gwHR3XhJJvVXP3QXbHCCbS2gO1w.jpg', '1993-12-15', 9.0, 13398, 78.3, '18,36,80', 96067179, 195, 'Released', 'Whoever saves one life, saves the world entire'),
(155, 'The Dark Knight Rises', 'The Dark Knight Rises', 'Eight years after the Joker\'s reign of anarchy, the Dark Knight is forced to rise', '/1hf3q6K7BUx0U7h4O2wKqGWlCz6.jpg', '/n8V7v0BY8cXQxzZ8Z8Z8Z8Z8Z.jpg', '2012-07-20', 8.5, 25342, 74.5, '28,12,18', 1081041287, 164, 'Released', 'A legend will rise'),
(496, 'The Silence of the Lambs', 'The Silence of the Lambs', 'A young FBI cadet must receive the help of an incarcerated and manipulative cannibal killer', '/rplLiMiokk0mpUlEAV1aO5OAeKf.jpg', '/4o4WdN2dDFvEXnIhqKEPfhDlVzI.jpg', '1991-02-14', 8.6, 14913, 78.2, '18,80', 272742922, 118, 'Released', 'A psychologist will have an intense battle of wits with an evil genius'),
(11, 'Star Wars', 'Star Wars', 'Luke Skywalker joins forces with a Jedi Knight, a cocky pilot, a Wookiee and two droids', '/6FfCtJ88ccQEQpNQhOo1BV7jn6h.jpg', '/a0P4lVZG2nXhxsvXBthT04t7iyb.jpg', '1977-05-25', 8.7, 12537, 77.8, '28,12,18', 775398007, 121, 'Released', 'A long time ago in a galaxy far, far away...'),
(19995, 'Avatar', 'Avatar', 'On Pandora, the richest planet in the galaxy, a paraplegic Marine falls in love with a Na\'vi princess', '/jRXYj3sqQcVeYZefsX00B5amz41.jpg', '/cja0YzuLT5h4MZTM1NNU3T2hM0i.jpg', '2009-12-18', 7.8, 32842, 79.5, '28,12,18,878', 2923706026, 162, 'Released', 'Enter the world of Pandora'),
(122, 'The Lord of the Rings: The Fellowship of the Ring', 'The Lord of the Rings: The Fellowship of the Ring', 'A meek Hobbit from the Shire and eight Companions embark on a journey', '/6oom5QYQ2yQTMJIbnvbkBL9cLrA.jpg', '/vv7t3x8wv2iGEUnotU0T9KJne0M.jpg', '2001-12-19', 8.8, 25634, 85.3, '12,28,18', 871468994, 178, 'Released', 'One ring to rule them all'),
(1399, 'Breaking Bad', 'Breaking Bad', 'A high school chemistry teacher turned meth lord', '/ggFHVNu6YYI5L9pIZv2DA4BPEyQ.jpg', '/x2lJBUChapman.jpg', '2008-01-20', 9.5, 10205, 88.5, '18,80', 0, 47, 'Returning Series', 'You either die a hero'),
(1396, 'Breaking Bad', 'Breaking Bad', 'A high school chemistry teacher turned meth lord', '/ggFHVNu6YYI5L9pIZv2DA4BPEyQ.jpg', '/x2lJBUChapman.jpg', '2008-01-20', 9.5, 10205, 88.5, '18,80', 0, 47, 'Returning Series', 'You either die a hero'),
(2000, 'Game of Thrones', 'Game of Thrones', 'Nine noble families fight for control of the lands of Westeros', '/u3bZgnrm459PzIhuP2QCu8iZK87.jpg', '/gX8SYlnL9OP6qGERaxX5BG2ksKY.jpg', '2011-04-17', 9.2, 8564, 87.2, '18,80', 0, 56, 'Ended', 'Winter is coming'),
(278, 'The Shawshank Redemption 2', 'The Shawshank Redemption 2', 'The continuing saga', '/q6725aR8Zs4IwGxzz4Ia5feAtm.jpg', '/A62tIvwJjYFApAtMTvnMViXHeHd.jpg', '1995-09-23', 8.5, 15000, 75.3, '18,80', 0, 120, 'Released', 'Hope revisited'),
(240, 'Pulp Fiction', 'Pulp Fiction', 'The lives of two mob hitmen, a boxer, a gangster and his wife intertwine in four tales of violence', '/qI5iotnsoi842tDQkDtkowq24mX.jpg', '/qfIPnWuxYXCVkSQexpg8Y6sTu1s.jpg', '1994-10-14', 8.9, 24320, 84.2, '18,80', 213959121, 154, 'Released', 'Just because you are a character doesn\'t mean you have character'),
(11, 'Interstellar', 'Interstellar', 'A team of explorers travel through a wormhole in space in an attempt to ensure humanity\'s survival', '/rZcFKXaIsKFCn8KYeUCRak0OVoy.jpg', '/gEU2QniE6E77NI6lCU6MxlNBvIx.jpg', '2014-11-07', 8.6, 28720, 82.4, '28,12,878', 677463113, 169, 'Released', 'We used to look up at the sky and wonder at our place in the stars'),
(278, 'The Matrix', 'The Matrix', 'A computer hacker learns from mysterious rebels about the true nature of his reality', '/vgqKSakL8c55Z0tdVq4F9X8aH5R.jpg', '/sPYaP200pPMc1MyimnotAI8JAzR.jpg', '1999-03-31', 8.7, 29342, 83.5, '28,12,878', 467222728, 136, 'Released', 'There is no spoon'),
(155, 'Forrest Gump', 'Forrest Gump', 'The presidencies of Kennedy and Johnson, the Vietnam War, and the Watergate scandal unfold from the perspective of an Alabama man', '/yE5d3BUEiBIWMw5UXE3r0J5tsKI.jpg', '/vr3dHchNDH7G5N9IUoObG5gLpXP.jpg', '1994-07-06', 8.8, 21689, 80.2, '35,18', 678226215, 142, 'Released', 'Life is like a box of chocolates'),
(240, 'Gladiator', 'Gladiator', 'A former Roman General sets out to exact vengeance against the corrupt emperor', '/dhwxsKRQHK9X9gq0VAwZ9H6xPrj.jpg', '/l9mJxDKxYZ9gVVULlMhM3vvt3cV.jpg', '2000-05-05', 8.5, 18954, 77.3, '28,12,18', 460622789, 155, 'Released', 'Are you not entertained?'),
(240, 'The Green Mile', 'The Green Mile', 'The lives of guards on Death Row are affected by one of their charges: a black man accused of child murder', '/mg8oVV79ghJ0yLT6vFvb8k2a4cH.jpg', '/hC8vZbhM4bPDC1LTN9YI77iBYsx.jpg', '1999-12-10', 8.5, 16543, 74.2, '18,80', 286801374, 189, 'Released', 'Cold steel, warm heart'),
(550, 'Se7en', 'Se7en', 'Two detectives hunt a serial killer who uses the seven deadly sins as his motives', '/8FjmMGyamOj7VW1u8MnCN7B9YKC.jpg', '/wN0BYAJhL8eZHtPRvbzM5u9wG4f.jpg', '1995-09-22', 8.6, 21834, 78.5, '18,80', 368875760, 127, 'Released', 'Seven deadly sins. Seven ways to die.'),
(238, 'Saving Private Ryan', 'Saving Private Ryan', 'Following the Normandy Landings, a group of U.S. soldiers go behind enemy lines to retrieve a paratrooper', '/dU5I3VKDS9fKT7XPuJqLpIJA2jc.jpg', '/h5oRSta34QLPadwPH6ERXVQ8OVD.jpg', '1998-07-24', 8.6, 19873, 76.8, '28,18,36', 481041849, 169, 'Released', 'Earn it'),
(240, 'The Usual Suspects', 'The Usual Suspects', 'A dramatic thriller about five hitmen who are brought together for an unlikely interrogation', '/r0W3VQ7ewohHY08SnGnkzWvC8nN.jpg', '/lBEIVJ56Yg78u8lB1L4MlJzBdLj.jpg', '1995-08-02', 8.5, 15642, 72.3, '18,80', 23997383, 106, 'Released', 'Give a man a gun and he\'s superman'),
(11, 'Parasite', 'Parasite', 'Greed and class discrimination threaten the newly formed symbiotic relationship between the wealthy Park family and the destitute Kim clan', '/vOipe2myi0mediMR1kS1hC7d7k.jpg', '/Y8X76zbJ3IjMwQ2bFJmX7Byo3W8.jpg', '2019-05-30', 8.6, 18742, 79.1, '18,80', 263057283, 132, 'Released', 'All of us are rich'),
(240, 'Back to the Future', 'Back to the Future', 'A teenager is accidentally sent 30 years into the past and must ensure his parents fall in love', '/wVjMAOlzFgXVKNwi2TbA0O2T7wn.jpg', '/pTF0ZF09ZVYb12FC01zkYc4FJtz.jpg', '1985-11-05', 8.5, 18432, 75.4, '12,35,18', 388311760, 116, 'Released', 'A comedy about a boy, his car and a very strange trip'),
(550, 'Whiplash', 'Whiplash', 'A promising young drummer enrolls at a cut-throat music conservatory', '/l2CuxCa3yYvLWfcbow0ZQ40O6aD.jpg', '/MbDDd6VNg84rDKsqYKfIBBKb0KG.jpg', '2014-10-10', 8.5, 16873, 74.6, '18,15', 49346468, 107, 'Released', 'Not quite my tempo'),
(240, 'The Prestige', 'The Prestige', 'After a tragic accident, two stage magicians engage in a battle to create the ultimate illusion', '/JI0i7GwvSy2W25nYLC8LHNh6QgJ.jpg', '/qDHfkkKm5eoHBxf4nM6YE0X8dXo.jpg', '2006-10-20', 8.5, 19654, 73.8, '28,12,18', 110721957, 130, 'Released', 'Are you watching closely?'),
(240, 'The Truman Show', 'The Truman Show', 'An insurance salesman discovers his whole life is actually a reality TV show', '/8Z8dptJEwtkUK76u9gWWi4bA9yU.jpg', '/fKYJ6q0C5xJLeyI2oGtPbXk8xPU.jpg', '1998-06-05', 8.3, 17893, 70.2, '35,12,18', 265460351, 103, 'Released', 'On the air. Unaware.'),
(550, 'The Wolf of Wall Street', 'The Wolf of Wall Street', 'Based on the true story of Jordan Belfort, from his rise to a wealthy stockbroker to his fall involving crime and corruption', '/cWDW0VIGdeeFTWGh9x2gHv91Sx8.jpg', '/34fSHnWGuKVeJn31QXa3T28gVXM.jpg', '2013-12-25', 8.2, 19753, 72.5, '18,80', 392006702, 180, 'Released', 'Earn. Spend. Betray.'),
(240, 'Goodfellas', 'Goodfellas', 'The story of Henry Hill and his life in the mob', '/vkLBn5qvCCwCXjHnMeXR9vZpRX4.jpg', '/d3CpEHzc2ZfKlVfC7rbCx2FkGU.jpg', '1990-09-19', 8.7, 18542, 75.3, '18,80', 47007303, 146, 'Released', 'As funny as it is tough'),
(280, 'Casablanca', 'Casablanca', 'In Casablanca, Morocco, during the early days of World War II', '/czjOB08Uo8D0TgrTQwejzQ8M56.jpg', '/V1988IfExbUbJxnJBRqE7jmCVhf.jpg', '1942-11-26', 8.5, 12453, 68.9, '18,35,80', 1044000, 102, 'Released', 'Here\'s looking at you, kid'),
(240, 'It\'s a Wonderful Life', 'It\'s a Wonderful Life', 'An angel is sent from Heaven to help a desperately frustrated businessman by showing him what his town would be like', '/vvLeqHmJXBL8fBTjJxVJCbhMT1g.jpg', '/6YkyCgJV1BQrFpBmZq5RgL3hWn0.jpg', '1946-12-07', 8.7, 14532, 72.1, '35,18,80', 0, 130, 'Released', 'You\'ll laugh, you\'ll cry, you\'ll be glad you lived'),
(240, 'Vertigo', 'Vertigo', 'A retired San Francisco police detective obsessed with an old case spirals downward after a new assignment', '/4e3bQFiRZNQaGvDdFASKR1sRqTu.jpg', '/A1zRIV6N8LkKZG9V3PpYjP6b3oU.jpg', '1958-05-09', 8.3, 13234, 65.4, '18,53,80', 0, 128, 'Released', 'The Man Who Was Afraid'),
(240, 'Citizen Kane', 'Citizen Kane', 'Following the death of publishing tycoon Charles Foster Kane, reporters scramble to discover the meaning of his final utterance', '/gV3kqjT7qsIowmPvj4SjLXKCb2l.jpg', '/MxGJa0TbG0rKwmKGMbk8rPZNZAL.jpg', '1941-05-01', 8.3, 11234, 62.8, '18,35,80', 0, 119, 'Released', 'The greatest motion picture ever made'),
(240, 'Rear Window', 'Rear Window', 'A photographer with a broken leg observes a murder in a neighbor\'s apartment', '/eFXvHxLuN8gGrTxVQGc8VKvV7Bd.jpg', '/2Tb4p8LBbJ24KVJhC3P8xJVXMZY.jpg', '1954-08-01', 8.4, 12342, 68.3, '18,53,80', 0, 112, 'Released', 'It\'s a THRILLER!'),
(240, 'Singin\' in the Rain', 'Singin\' in the Rain', 'An in-love pair work and play in movies and go through the coming of sound era', '/u3Ey4p1gU19RdPf48Xpd3W9OYgq.jpg', '/2IeFJr9L1f0A5RjUfSVBh7yCEJX.jpg', '1952-04-02', 8.3, 10654, 65.2, '35,12,18', 0, 103, 'Released', 'The most entertaining film ever made'),
(11, 'The Lion King', 'The Lion King', 'Lion prince Simba and his father are targeted by his bitter uncle', '/sZ0K24oyS8c.jpg', '/WKn4kPS2tji7H2r8CWF44HZ5uMp.jpg', '1994-06-19', 8.3, 18934, 73.6, '16,18,10,35', 1149460882, 88, 'Released', 'The Circle of Life'),
(240, 'Aladdin', 'Aladdin', 'A street urchin and a princess fall in love while evading a villainous sorceress', '/tf7PrLnWEV2p13eZEFTtxeCY3eE.jpg', '/lJwSEcgMOcVjxZ59QotataBg2D.jpg', '1992-11-13', 8.0, 17324, 71.8, '16,18,10,35', 504050219, 90, 'Released', 'A whole new world'),
(240, 'Beauty and the Beast', 'Beauty and the Beast', 'A selfish prince is cursed to become a monster for the rest of his life', '/N2QMDOUu4Eoec75p6fLyPHK2gQl.jpg', '/5Iw7zQm8JCBaja0DYwDqrepyAlF.jpg', '2017-03-17', 7.1, 12423, 69.5, '16,18,10,35', 1264016500, 129, 'Released', 'Tale as old as time'),
(240, 'Toy Story', 'Toy Story', 'A cowboy doll is accidentally knocked out the window', '/UpUc9sWw94tfsKIBxcAeO5PX8tI.jpg', '/1mthIgNCG7L4H8Lf9Ep8tT4t0km.jpg', '1995-11-22', 8.3, 20143, 75.2, '16,18,10,35,12', 373554033, 81, 'Released', 'To infinity and beyond!'),
(240, 'Coco', 'Coco', 'Aspiring musician Miguel finds himself in the stunning and colorful Land of the Dead after accidentally triggering an ancient curse', '/gGEsBPAoWvI0Q6V2z65ht0Iuwq1.jpg', '/aHHVGVIMUyrQDJ3z8CIc87MJAVw.jpg', '2017-11-22', 8.4, 15234, 72.3, '16,18,10,35,12', 807082162, 105, 'Released', 'Remember me'),
(11, 'Frozen', 'Frozen', 'When the newly crowned Queen Elsa accidentally uses her power to turn things into ice to curse her home in infinite winter', '/nRougNtWejD1b8bbXGCNRD-EaKI.jpg', '/voJB8lhWHB4zrHM4suIARa7u3cC.jpg', '2013-11-27', 7.6, 18234, 70.1, '16,18,10,35,12', 1290000000, 102, 'Released', 'Some people are worth melting for'),
(240, 'Moana', 'Moana', 'In ancient Polynesia, when a terrible curse incapacitates Maui, the mighty demigod, the discovery of an island-girl', '/lulJQgIeSCsoMn0O7C1NfYV4gWI.jpg', '/cSoMM9iS2nh7A1sM3PwY3vL0Q1h.jpg', '2016-11-23', 7.7, 16543, 71.2, '16,18,10,35,12', 643344523, 107, 'Released', 'Know who you are'),
(11, 'The Avengers', 'The Avengers', 'Earth\'s mightiest heroes must come together and learn to fight as a team', '/lulJQgIeSCsoMn0O7C1NfYV4gWI.jpg', '/hbn46fQaAMN8fY7O9gLcnxEhxX0.jpg', '2012-05-04', 8.0, 28342, 79.1, '28,12,878,18', 1520642960, 143, 'Released', 'Some people call me a boss'),
(11, 'Avengers: Endgame', 'Avengers: Endgame', 'After the devastating events, the Avengers assemble once more', '/SYk4VrSdv0GfPnqan8FSVcyNqfq.jpg', '/or06FN3Dka5tukK1e9fYjO7R4Ms.jpg', '2019-04-26', 8.4, 28934, 84.2, '28,12,878,18', 2798754111, 181, 'Released', 'Avenge the fallen'),
(11, 'Black Panther', 'Black Panther', 'T\'Challa, the King of the African nation of Wakanda, steps into the spotlight after his father\'s death', '/uxzzxijgPIY7pNMV660Sax7I4xQ.jpg', '/b6ZJZHUdYl2QwCsNEDlH6XUq3Xf.jpg', '2018-02-16', 7.3, 18234, 75.3, '28,12,878,18', 1346913161, 134, 'Released', 'Long live the king'),
(11, 'Thor: Love and Thunder', 'Thor: Love and Thunder', 'Thor embarks on a journey unlike anything he\'s ever faced', '/pIkRyX5amzc9WxBBMXixsiFMVVG.jpg', '/gDFvxdfAusj1DATA8I0NjFDhMKh.jpg', '2022-07-06', 6.7, 12543, 68.5, '28,12,878,18', 760195435, 119, 'Released', 'Love is the most powerful force in the universe'),
(11, 'Doctor Strange', 'Doctor Strange', 'While on a journey of physical and spiritual healing, a brilliant neurosurgeon discovers the mysteries of the multiverse', '/4DrcyJqly0Whsoo3IdqQ6E1ELsp.jpg', '/z1p34vh7dEOnLDmyCrlUVLuoDzd.jpg', '2016-11-04', 7.5, 18832, 74.8, '28,12,878,18', 677463575, 115, 'Released', 'The origin of evil is just the beginning'),
(11, 'Iron Man', 'Iron Man', 'When brilliant scientist Tony Stark is forced to build an armored suit after a tragedy', '/78lPtwv72eTNqFW9COBYI0dWDJa.jpg', '/dJJcgcNe5Y5U5C0AE8dHVk2yOx.jpg', '2008-05-02', 7.9, 26543, 77.2, '28,12,878,18', 585366247, 126, 'Released', 'I am Iron Man'),
(11, 'Captain America: The First Avenger', 'Captain America: The First Avenger', 'Steve Rogers, a rejected military soldier, transforms into Captain America', '/RYMX2cwTiDQFfSrWyLygMApK2CU.jpg', '/qJv0F5z5bQuMSvmO6FeG8LsxCYj.jpg', '2011-07-22', 6.9, 16234, 70.5, '28,12,878,18', 371924621, 124, 'Released', 'When he first came out, he was America\'s hope'),
(11, 'Spider-Man', 'Spider-Man', 'The story of Peter Parker who becomes Spider-Man', '/vxHV6TLLrnIkjW4AcnzNkqPPZOa.jpg', '/gh4cq54Lpnv4159ttzIvVSHBKec.jpg', '2002-05-03', 7.3, 20143, 72.3, '28,12,878,18', 822635794, 121, 'Released', 'With great power comes great responsibility');

-- Ahora asignar películas a plataformas de forma realista

-- Netflix (1) - películas populares mainstream
INSERT IGNORE INTO movies_platforms (movie_id, platform_id) VALUES
(2, 1), -- Shawshank Redemption
(3, 1), -- Inception
(7, 1), -- Dark Knight Rises
(11, 1), -- Star Wars
(15, 1), -- Breaking Bad
(17, 1), -- Interstellar
(22, 1), -- Parasite
(25, 1), -- Whiplash
(27, 1), -- Wolf of Wall Street
(29, 1), -- Goodfellas
(31, 1), -- It's a Wonderful Life
(35, 1), -- Lion King
(37, 1), -- Toy Story
(39, 1), -- Frozen
(40, 1); -- Moana

-- HBO Max (4) - películas prestige y clásicas
INSERT IGNORE INTO movies_platforms (movie_id, platform_id) VALUES
(4, 4), -- Godfather
(5, 4), -- Godfather Part II
(6, 4), -- Schindler's List
(8, 4), -- Silence of the Lambs
(12, 4), -- Breaking Bad (TV)
(21, 4), -- Se7en
(24, 4), -- Usual Suspects
(26, 4), -- Back to the Future
(28, 4), -- Prestige
(30, 4), -- Truman Show
(32, 4), -- Casablanca
(33, 4), -- Vertigo
(34, 4), -- Citizen Kane
(36, 4), -- Aladdin
(38, 4); -- Coco

-- Prime Video (2) - variedad de películas
INSERT IGNORE INTO movies_platforms (movie_id, platform_id) VALUES
(1, 2), -- Fight Club
(9, 2), -- Silence of Lambs
(10, 2), -- Lord of the Rings
(13, 2), -- Breaking Bad alt
(18, 2), -- Matrix
(19, 2), -- Forrest Gump
(20, 2), -- Gladiator
(23, 2), -- Beauty and Beast
(41, 2), -- Black Panther
(42, 2), -- Thor Love and Thunder
(43, 2), -- Doctor Strange
(44, 2), -- Iron Man
(45, 2); -- Spider-Man

-- Disney+ (3) - películas Disney, Pixar, Marvel
INSERT IGNORE INTO movies_platforms (movie_id, platform_id) VALUES
(35, 3), -- Lion King
(37, 3), -- Toy Story
(38, 3), -- Coco
(39, 3), -- Frozen
(40, 3), -- Moana
(41, 3), -- Black Panther
(42, 3), -- Thor Love and Thunder
(43, 3), -- Doctor Strange
(44, 3), -- Iron Man
(45, 3); -- Spider-Man

-- Peliculas en múltiples plataformas (realista)
INSERT IGNORE INTO movies_platforms (movie_id, platform_id) VALUES
(2, 2), -- Shawshank en Prime también
(3, 2), -- Inception en Prime
(16, 1), -- Pulp Fiction en Netflix
(16, 2), -- Pulp Fiction en Prime
(36, 1), -- Aladdin en Netflix
(37, 1), -- Toy Story en Netflix
(38, 1); -- Coco en Netflix
