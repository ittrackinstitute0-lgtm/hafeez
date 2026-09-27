-- ====================================================
-- KITABGHAR ONLINE BOOKSTORE - SUPABASE DATABASE SCHEMA
-- ====================================================
-- Run this script in your Supabase SQL Editor:
-- https://supabase.com/dashboard/project/gonheahzxpexxgaavsme/sql/new

-- 1. Create the `books` table
CREATE TABLE IF NOT EXISTS public.books (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title TEXT NOT NULL,
    author TEXT NOT NULL,
    category TEXT NOT NULL,
    price NUMERIC(10, 2) NOT NULL,
    old_price NUMERIC(10, 2),
    rating NUMERIC(3, 1) DEFAULT 4.8,
    description TEXT,
    image_url TEXT,
    stock INTEGER DEFAULT 25,
    is_featured BOOLEAN DEFAULT false,
    created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 2. Create the `orders` table
CREATE TABLE IF NOT EXISTS public.orders (
    id TEXT PRIMARY KEY, -- e.g. ORD-74921
    customer_name TEXT NOT NULL,
    customer_phone TEXT NOT NULL,
    customer_email TEXT,
    shipping_address TEXT NOT NULL,
    city TEXT NOT NULL,
    payment_method TEXT DEFAULT 'Cash on Delivery',
    notes TEXT,
    items JSONB NOT NULL, -- Array of ordered items [{id, title, price, quantity, image_url}]
    subtotal NUMERIC(10, 2) NOT NULL,
    shipping_fee NUMERIC(10, 2) DEFAULT 0,
    discount NUMERIC(10, 2) DEFAULT 0,
    total_amount NUMERIC(10, 2) NOT NULL,
    status TEXT DEFAULT 'Pending', -- 'Pending', 'Confirmed', 'Processing', 'Shipped', 'Delivered', 'Cancelled'
    created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 3. Enable Row Level Security (RLS)
ALTER TABLE public.books ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;

-- 4. Policies for `books`
-- Allow everyone to view books
DROP POLICY IF EXISTS "Allow public read access to books" ON public.books;
CREATE POLICY "Allow public read access to books" 
ON public.books FOR SELECT USING (true);

-- Allow inserting, updating, and deleting books
DROP POLICY IF EXISTS "Allow anon book insert" ON public.books;
CREATE POLICY "Allow anon book insert" 
ON public.books FOR INSERT WITH CHECK (true);

DROP POLICY IF EXISTS "Allow anon book update" ON public.books;
CREATE POLICY "Allow anon book update" 
ON public.books FOR UPDATE USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Allow anon book delete" ON public.books;
CREATE POLICY "Allow anon book delete" 
ON public.books FOR DELETE USING (true);

-- 5. Policies for `orders`
-- Allow public customers to place orders
DROP POLICY IF EXISTS "Allow anon create orders" ON public.orders;
CREATE POLICY "Allow anon create orders" 
ON public.orders FOR INSERT WITH CHECK (true);

-- Allow public read access to orders (for tracking and admin panel)
DROP POLICY IF EXISTS "Allow anon read orders" ON public.orders;
CREATE POLICY "Allow anon read orders" 
ON public.orders FOR SELECT USING (true);

-- Allow updating orders (for changing status like Confirmed, Shipped, Delivered)
DROP POLICY IF EXISTS "Allow anon update orders" ON public.orders;
CREATE POLICY "Allow anon update orders" 
ON public.orders FOR UPDATE USING (true) WITH CHECK (true);

-- Allow deleting orders (for admin cleanup)
DROP POLICY IF EXISTS "Allow anon delete orders" ON public.orders;
CREATE POLICY "Allow anon delete orders" 
ON public.orders FOR DELETE USING (true);

-- 6. Insert Starter Books Data
INSERT INTO public.books (title, author, category, price, old_price, rating, description, image_url, stock, is_featured)
VALUES
(
    'Peer-e-Kamil (پیر کامل)', 
    'Umera Ahmed', 
    'Urdu Adab', 
    1450, 
    1800, 
    4.9, 
    'One of the most celebrated Urdu novels exploring faith, spiritual redemption, and true divine love through the captivating journeys of Imama and Salar.', 
    'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=600&auto=format&fit=crop&q=80', 
    35, 
    true
),
(
    'Atomic Habits', 
    'James Clear', 
    'Self-Help', 
    1250, 
    1600, 
    4.9, 
    'An easy and proven way to build good habits and break bad ones. Transform your daily routines and achieve remarkable results through tiny changes.', 
    'https://images.unsplash.com/photo-1589829085413-56de8ae18c73?w=600&auto=format&fit=crop&q=80', 
    50, 
    true
),
(
    'Ar-Raheeq Al-Makhtum (The Sealed Nectar)', 
    'Safiur Rahman Mubarakpuri', 
    'Islamic', 
    1850, 
    2200, 
    5.0, 
    'The award-winning authoritative biography of Prophet Muhammad (PBUH), honored by the Muslim World League for its scholarly rigor and inspiring narrative.', 
    'https://images.unsplash.com/photo-1585829365295-ab7cd400c167?w=600&auto=format&fit=crop&q=80', 
    40, 
    true
),
(
    'The Psychology of Money', 
    'Morgan Housel', 
    'Finance & Business', 
    1150, 
    1450, 
    4.8, 
    'Timeless lessons on wealth, greed, and happiness doing well with money isn''t necessarily about what you know. It''s about how you behave.', 
    'https://images.unsplash.com/photo-1592496431122-2349e0fbc666?w=600&auto=format&fit=crop&q=80', 
    30, 
    true
),
(
    'Aab-e-Hayat (آب حیات)', 
    'Umera Ahmed', 
    'Urdu Adab', 
    1550, 
    1950, 
    4.9, 
    'The official sequel to the monumental novel Peer-e-Kamil, continuing the lives and spiritual tests of Salar Sikandar and Imama Hashim.', 
    'https://images.unsplash.com/photo-1512820790803-83ca734da794?w=600&auto=format&fit=crop&q=80', 
    25, 
    false
),
(
    'Jannat Kay Pattay (جنت کے پتے)', 
    'Nemrah Ahmed', 
    'Urdu Adab', 
    1600, 
    2000, 
    4.8, 
    'A thrilling socio-romantic Urdu novel featuring Haya Suleman and Cihan Sikandar, traversing struggles in Turkey, espionage, and devotion to Islamic values.', 
    'https://images.unsplash.com/photo-1543002588-bfa74002ed7e?w=600&auto=format&fit=crop&q=80', 
    28, 
    true
),
(
    'Rich Dad Poor Dad', 
    'Robert T. Kiyosaki', 
    'Finance & Business', 
    990, 
    1300, 
    4.7, 
    'What the rich teach their kids about money that the poor and middle class do not. The world''s number one personal finance book.', 
    'https://images.unsplash.com/photo-1553729459-efe14ef6055d?w=600&auto=format&fit=crop&q=80', 
    45, 
    false
),
(
    'The Alchemist', 
    'Paulo Coelho', 
    'Fiction', 
    950, 
    1200, 
    4.7, 
    'The magical story of Santiago, an Andalusian shepherd boy who yearns to travel in search of a worldly treasure as extravagant as any ever found.', 
    'https://images.unsplash.com/photo-1532012164546-f432f2e3777f?w=600&auto=format&fit=crop&q=80', 
    35, 
    false
),
(
    'Stories of the Prophets (Qasas-ul-Anbiya)', 
    'Ibn Kathir', 
    'Islamic', 
    1700, 
    2100, 
    4.9, 
    'Authentic accounts and stories of the messengers of Allah from Adam (AS) to Isa (AS) derived from the Holy Quran and authentic Hadith literature.', 
    'https://images.unsplash.com/photo-1579783900882-c0d3dad7b119?w=600&auto=format&fit=crop&q=80', 
    20, 
    false
),
(
    'Deep Work: Rules for Focused Success', 
    'Cal Newport', 
    'Self-Help', 
    1200, 
    1500, 
    4.8, 
    'One of the most valuable skills in our economy is becoming increasingly rare: the ability to focus without distraction on a cognitively demanding task.', 
    'https://images.unsplash.com/photo-1497633762265-9d179a990aa6?w=600&auto=format&fit=crop&q=80', 
    22, 
    false
),
(
    'Mushaf (مصحف)', 
    'Nemrah Ahmed', 
    'Urdu Adab', 
    1350, 
    1700, 
    4.8, 
    'An inspiring Urdu novel about Mehmil Ibrahim whose hopeless life transforms when she starts discovering divine guidance in the verses of the Holy Quran.', 
    'https://images.unsplash.com/photo-1495640388908-05fa85288e61?w=600&auto=format&fit=crop&q=80', 
    18, 
    false
),
(
    'Zero to One: Notes on Startups', 
    'Peter Thiel', 
    'Finance & Business', 
    1100, 
    1400, 
    4.7, 
    'The great secret of our time is that there are still uncharted frontiers to explore and new inventions to create. How to build companies that shape the future.', 
    'https://images.unsplash.com/photo-1516979187457-637abb4f9353?w=600&auto=format&fit=crop&q=80', 
    25, 
    false
);
