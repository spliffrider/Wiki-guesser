# Google Sheets Templates for Wiki Guesser Questions

This guide shows how to structure Google Sheets for easy CSV import into Supabase.

---

## 1. Odd Wiki Out (`odd_wiki_out_questions`)

**Game concept:** 4 items shown, player picks the one that doesn't belong.

### Data Entry Columns (Human-Friendly)
| A: Theme | B: Item 1 | C: Item 2 | D: Item 3 | E: Item 4 (Impostor) | F: Explanation | G: Wikipedia URL |
|----------|-----------|-----------|-----------|----------------------|----------------|------------------|
| The Beatles | John Lennon | Paul McCartney | George Harrison | Mick Jagger | The first three were Beatles members. Mick Jagger is from The Rolling Stones. | https://en.wikipedia.org/wiki/The_Beatles |

### Export Columns (For Supabase CSV)
Create these columns with formulas, then copy as values:

| Column | Header | Formula (row 2) |
|--------|--------|-----------------|
| H | `items` | `="{" & B2 & "," & C2 & "," & D2 & "," & E2 & "}"` |
| I | `impostor_index` | `=3` |
| J | `connection` | `=F2` |
| K | `wikipedia_url` | `=G2` |

**Export columns H-K as CSV.**

---

## 2. When In Wiki (`when_in_wiki_questions`)

**Game concept:** Player guesses what year a historical event occurred.

### Data Entry Columns (Human-Friendly)
| A: Event Description | B: Correct Year | C: Wrong Year 1 | D: Wrong Year 2 | E: Wrong Year 3 | F: Wikipedia URL |
|----------------------|-----------------|-----------------|-----------------|-----------------|------------------|
| The first moon landing occurred | 1969 | 1965 | 1972 | 1959 | https://en.wikipedia.org/wiki/Apollo_11 |

### Export Columns (For Supabase CSV)
| Column | Header | Formula (row 2) |
|--------|--------|-----------------|
| G | `event` | `=A2` |
| H | `correct_year` | `=B2` |
| I | `year_options` | `="{" & B2 & "," & C2 & "," & D2 & "," & E2 & "}"` |
| J | `wikipedia_url` | `=F2` |

**Export columns G-J as CSV.**

---

## 3. Wiki Or Fiction (`wiki_or_fiction_questions`)

**Game concept:** Player decides if a statement is TRUE or FALSE.

### Data Entry Columns (Human-Friendly)
| A: Statement | B: True/False | C: Explanation | D: Wikipedia URL |
|--------------|---------------|----------------|------------------|
| Honey never spoils and 3000-year-old honey was found edible in Egyptian tombs | TRUE | Honey's low moisture and acidic pH prevent bacterial growth | https://en.wikipedia.org/wiki/Honey |
| The Great Wall of China is visible from space with the naked eye | FALSE | This is a common myth. The wall is too narrow to be seen from orbit. | https://en.wikipedia.org/wiki/Great_Wall_of_China |

### Export Columns (For Supabase CSV)
| Column | Header | Formula (row 2) |
|--------|--------|-----------------|
| E | `statement` | `=A2` |
| F | `is_true` | `=IF(UPPER(B2)="TRUE", true, false)` |
| G | `explanation` | `=C2` |
| H | `wikipedia_url` | `=D2` |

**Note:** For `is_true`, Supabase expects lowercase `true` or `false` (not TRUE/FALSE).

**Export columns E-H as CSV.**

---

## 4. Wiki Links (`wiki_links_questions`)

**Game concept:** 4 Wikipedia topics shown, player guesses what connects them.

### Data Entry Columns (Human-Friendly)
| A: Title 1 | B: Title 2 | C: Title 3 | D: Title 4 | E: Connection (Correct) | F: Wrong Option 1 | G: Wrong Option 2 | H: Wrong Option 3 | I: Wikipedia URL |
|------------|------------|------------|------------|-------------------------|-------------------|-------------------|-------------------|------------------|
| Eiffel Tower | Big Ben | Leaning Tower of Pisa | Empire State Building | Famous landmarks | European cities | Tallest buildings | UNESCO sites | https://en.wikipedia.org/wiki/Landmark |

### Export Columns (For Supabase CSV)
| Column | Header | Formula (row 2) |
|--------|--------|-----------------|
| J | `titles` | `="{" & A2 & "," & B2 & "," & C2 & "," & D2 & "}"` |
| K | `connection` | `=E2` |
| L | `connection_options` | `="{" & E2 & "," & F2 & "," & G2 & "," & H2 & "}"` |
| M | `wikipedia_url` | `=I2` |

**Export columns J-M as CSV.**

---

## Import Process

1. **Fill in data entry columns** (the human-friendly ones)
2. **Add formula columns** to the right
3. **Copy formula columns → Paste Values** (removes formulas)
4. **Select only the export columns** (not the data entry columns)
5. **File → Download → CSV**
6. **Supabase → Table Editor → [table name] → Import Data**
7. Upload CSV, map columns, import

---

## Tips

- **Don't include `id` or `created_at`** - Supabase auto-generates these
- **Array format:** Use curly braces `{item1,item2,item3}` for PostgreSQL arrays
- **Commas in text:** If your text contains commas, the CSV might break. Wrap in quotes or avoid commas.
- **Special characters:** ñ, é, ü etc. work fine - just ensure UTF-8 encoding when downloading CSV
