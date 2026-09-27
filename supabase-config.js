// ==========================================================
// KITABGHAR - SUPABASE CONFIGURATION & CLIENT SERVICES
// ==========================================================

const SUPABASE_URL = "https://gonheahzxpexxgaavsme.supabase.co";
const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImdvbmhlYWh6eHBleHhnYWF2c21lIiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTA0OTQzNTQsImV4cCI6MjEwNjA3MDM1NH0.Oyna1_HitphIrgaFCRQILwMD8OvsSo6EbnIrdS-qJfM";

// Initialize Supabase Client if library is available
let supabaseClient = null;
if (window.supabase) {
    try {
        supabaseClient = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
        console.log("Supabase Client initialized successfully.");
    } catch (err) {
        console.error("Failed to initialize Supabase Client:", err);
    }
} else {
    console.warn("Supabase library not found in window. Local mode fallback active.");
}

// Default initial starter catalog (for instant preview before or alongside Supabase sync)
const DEFAULT_BOOKS = [
    {
        id: "b1",
        title: "Peer-e-Kamil (پیر کامل)",
        author: "Umera Ahmed",
        category: "Urdu Adab",
        price: 1450,
        old_price: 1800,
        rating: 4.9,
        description: "One of the most celebrated Urdu novels exploring faith, spiritual redemption, and true divine love through the captivating journeys of Imama and Salar.",
        image_url: "https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=600&auto=format&fit=crop&q=80",
        stock: 35,
        is_featured: true
    },
    {
        id: "b2",
        title: "Atomic Habits",
        author: "James Clear",
        category: "Self-Help",
        price: 1250,
        old_price: 1600,
        rating: 4.9,
        description: "An easy and proven way to build good habits and break bad ones. Transform your daily routines and achieve remarkable results through tiny changes.",
        image_url: "https://images.unsplash.com/photo-1589829085413-56de8ae18c73?w=600&auto=format&fit=crop&q=80",
        stock: 50,
        is_featured: true
    },
    {
        id: "b3",
        title: "Ar-Raheeq Al-Makhtum (The Sealed Nectar)",
        author: "Safiur Rahman Mubarakpuri",
        category: "Islamic",
        price: 1850,
        old_price: 2200,
        rating: 5.0,
        description: "The award-winning authoritative biography of Prophet Muhammad (PBUH), honored by the Muslim World League for its scholarly rigor and inspiring narrative.",
        image_url: "https://images.unsplash.com/photo-1585829365295-ab7cd400c167?w=600&auto=format&fit=crop&q=80",
        stock: 40,
        is_featured: true
    },
    {
        id: "b4",
        title: "The Psychology of Money",
        author: "Morgan Housel",
        category: "Finance & Business",
        price: 1150,
        old_price: 1450,
        rating: 4.8,
        description: "Timeless lessons on wealth, greed, and happiness. Doing well with money isn't necessarily about what you know. It's about how you behave.",
        image_url: "https://images.unsplash.com/photo-1592496431122-2349e0fbc666?w=600&auto=format&fit=crop&q=80",
        stock: 30,
        is_featured: true
    },
    {
        id: "b5",
        title: "Aab-e-Hayat (آب حیات)",
        author: "Umera Ahmed",
        category: "Urdu Adab",
        price: 1550,
        old_price: 1950,
        rating: 4.9,
        description: "The official sequel to the monumental novel Peer-e-Kamil, continuing the lives and spiritual tests of Salar Sikandar and Imama Hashim.",
        image_url: "https://images.unsplash.com/photo-1512820790803-83ca734da794?w=600&auto=format&fit=crop&q=80",
        stock: 25,
        is_featured: false
    },
    {
        id: "b6",
        title: "Jannat Kay Pattay (جنت کے پتے)",
        author: "Nemrah Ahmed",
        category: "Urdu Adab",
        price: 1600,
        old_price: 2000,
        rating: 4.8,
        description: "A thrilling socio-romantic Urdu novel featuring Haya Suleman and Cihan Sikandar, traversing struggles in Turkey, espionage, and devotion to Islamic values.",
        image_url: "https://images.unsplash.com/photo-1543002588-bfa74002ed7e?w=600&auto=format&fit=crop&q=80",
        stock: 28,
        is_featured: true
    },
    {
        id: "b7",
        title: "Rich Dad Poor Dad",
        author: "Robert T. Kiyosaki",
        category: "Finance & Business",
        price: 990,
        old_price: 1300,
        rating: 4.7,
        description: "What the rich teach their kids about money that the poor and middle class do not. The world's number one personal finance book.",
        image_url: "https://images.unsplash.com/photo-1553729459-efe14ef6055d?w=600&auto=format&fit=crop&q=80",
        stock: 45,
        is_featured: false
    },
    {
        id: "b8",
        title: "The Alchemist",
        author: "Paulo Coelho",
        category: "Fiction",
        price: 950,
        old_price: 1200,
        rating: 4.7,
        description: "The magical story of Santiago, an Andalusian shepherd boy who yearns to travel in search of a worldly treasure as extravagant as any ever found.",
        image_url: "https://images.unsplash.com/photo-1532012164546-f432f2e3777f?w=600&auto=format&fit=crop&q=80",
        stock: 35,
        is_featured: false
    },
    {
        id: "b9",
        title: "Stories of the Prophets (Qasas-ul-Anbiya)",
        author: "Ibn Kathir",
        category: "Islamic",
        price: 1700,
        old_price: 2100,
        rating: 4.9,
        description: "Authentic accounts and stories of the messengers of Allah from Adam (AS) to Isa (AS) derived from the Holy Quran and authentic Hadith literature.",
        image_url: "https://images.unsplash.com/photo-1579783900882-c0d3dad7b119?w=600&auto=format&fit=crop&q=80",
        stock: 20,
        is_featured: false
    },
    {
        id: "b10",
        title: "Deep Work: Rules for Focused Success",
        author: "Cal Newport",
        category: "Self-Help",
        price: 1200,
        old_price: 1500,
        rating: 4.8,
        description: "One of the most valuable skills in our economy is becoming increasingly rare: the ability to focus without distraction on a cognitively demanding task.",
        image_url: "https://images.unsplash.com/photo-1497633762265-9d179a990aa6?w=600&auto=format&fit=crop&q=80",
        stock: 22,
        is_featured: false
    }
];

// Local Storage helpers for fallback persistence
const LOCAL_STORAGE_KEYS = {
    BOOKS: "kitabghar_local_books",
    ORDERS: "kitabghar_local_orders",
    CART: "kitabghar_cart"
};

function getLocalBooks() {
    const raw = localStorage.getItem(LOCAL_STORAGE_KEYS.BOOKS);
    if (!raw) {
        localStorage.setItem(LOCAL_STORAGE_KEYS.BOOKS, JSON.stringify(DEFAULT_BOOKS));
        return DEFAULT_BOOKS;
    }
    try {
        return JSON.parse(raw);
    } catch {
        return DEFAULT_BOOKS;
    }
}

function setLocalBooks(books) {
    localStorage.setItem(LOCAL_STORAGE_KEYS.BOOKS, JSON.stringify(books));
}

function getLocalOrders() {
    const raw = localStorage.getItem(LOCAL_STORAGE_KEYS.ORDERS);
    if (!raw) return [];
    try {
        return JSON.parse(raw);
    } catch {
        return [];
    }
}

function setLocalOrders(orders) {
    localStorage.setItem(LOCAL_STORAGE_KEYS.ORDERS, JSON.stringify(orders));
}

// ==========================================================
// SUPABASE DATA ACCESS LAYER
// ==========================================================

const dbService = {
    // Check if Supabase tables exist and are reachable
    async checkConnection() {
        if (!supabaseClient) return { connected: false, error: "Supabase client not loaded" };
        try {
            const { data, error } = await supabaseClient
                .from('books')
                .select('id')
                .limit(1);

            if (error) {
                return { connected: false, error: error.message };
            }
            return { connected: true, booksCount: data.length };
        } catch (err) {
            return { connected: false, error: err.message };
        }
    },

    // Fetch all books
    async getBooks() {
        if (supabaseClient) {
            try {
                const { data, error } = await supabaseClient
                    .from('books')
                    .select('*')
                    .order('created_at', { ascending: false });

                if (!error && data && data.length > 0) {
                    return { data, source: 'supabase' };
                }
            } catch (err) {
                console.warn("Supabase fetch failed, falling back to local storage:", err);
            }
        }
        return { data: getLocalBooks(), source: 'local' };
    },

    // Add a new book
    async addBook(bookData) {
        if (supabaseClient) {
            try {
                const { data, error } = await supabaseClient
                    .from('books')
                    .insert([bookData])
                    .select();

                if (!error && data && data[0]) {
                    return { success: true, data: data[0], source: 'supabase' };
                }
            } catch (err) {
                console.warn("Supabase insert failed, saving locally:", err);
            }
        }

        // Fallback local
        const localBooks = getLocalBooks();
        const newBook = { ...bookData, id: 'local_' + Date.now(), created_at: new Date().toISOString() };
        localBooks.unshift(newBook);
        setLocalBooks(localBooks);
        return { success: true, data: newBook, source: 'local' };
    },

    // Update book
    async updateBook(id, bookData) {
        if (supabaseClient) {
            try {
                const { data, error } = await supabaseClient
                    .from('books')
                    .update(bookData)
                    .eq('id', id)
                    .select();

                if (!error) {
                    return { success: true, data, source: 'supabase' };
                }
            } catch (err) {
                console.warn("Supabase update failed, updating locally:", err);
            }
        }

        const localBooks = getLocalBooks();
        const index = localBooks.findIndex(b => b.id == id);
        if (index !== -1) {
            localBooks[index] = { ...localBooks[index], ...bookData };
            setLocalBooks(localBooks);
            return { success: true, data: localBooks[index], source: 'local' };
        }
        return { success: false, error: "Book not found" };
    },

    // Delete book
    async deleteBook(id) {
        if (supabaseClient) {
            try {
                const { error } = await supabaseClient
                    .from('books')
                    .delete()
                    .eq('id', id);

                if (!error) {
                    return { success: true, source: 'supabase' };
                }
            } catch (err) {
                console.warn("Supabase delete failed:", err);
            }
        }

        const localBooks = getLocalBooks();
        const filtered = localBooks.filter(b => b.id != id);
        setLocalBooks(filtered);
        return { success: true, source: 'local' };
    },

    // Place an Order
    async createOrder(orderPayload) {
        if (supabaseClient) {
            try {
                const { data, error } = await supabaseClient
                    .from('orders')
                    .insert([orderPayload])
                    .select();

                if (!error && data && data[0]) {
                    return { success: true, data: data[0], source: 'supabase' };
                } else if (error) {
                    console.warn("Supabase order error:", error);
                }
            } catch (err) {
                console.warn("Supabase order creation exception:", err);
            }
        }

        // Local fallback
        const orders = getLocalOrders();
        orders.unshift(orderPayload);
        setLocalOrders(orders);
        return { success: true, data: orderPayload, source: 'local' };
    },

    // Fetch all orders
    async getOrders() {
        if (supabaseClient) {
            try {
                const { data, error } = await supabaseClient
                    .from('orders')
                    .select('*')
                    .order('created_at', { ascending: false });

                if (!error && data) {
                    return { data, source: 'supabase' };
                }
            } catch (err) {
                console.warn("Supabase orders fetch error:", err);
            }
        }
        return { data: getLocalOrders(), source: 'local' };
    },

    // Find order by ID or Phone
    async searchOrder(query) {
        const cleanQuery = query.trim().toUpperCase();
        if (supabaseClient) {
            try {
                const { data, error } = await supabaseClient
                    .from('orders')
                    .select('*')
                    .or(`id.ilike.%${cleanQuery}%,customer_phone.ilike.%${cleanQuery}%`)
                    .limit(5);

                if (!error && data && data.length > 0) {
                    return { data, source: 'supabase' };
                }
            } catch (err) {
                console.warn("Supabase search order error:", err);
            }
        }

        const localOrders = getLocalOrders();
        const results = localOrders.filter(o => 
            (o.id && o.id.toUpperCase().includes(cleanQuery)) ||
            (o.customer_phone && o.customer_phone.includes(cleanQuery))
        );
        return { data: results, source: 'local' };
    },

    // Update order status
    async updateOrderStatus(orderId, status) {
        if (supabaseClient) {
            try {
                const { data, error } = await supabaseClient
                    .from('orders')
                    .update({ status: status })
                    .eq('id', orderId)
                    .select();

                if (!error) {
                    return { success: true, data, source: 'supabase' };
                }
            } catch (err) {
                console.warn("Supabase order status update error:", err);
            }
        }

        const orders = getLocalOrders();
        const idx = orders.findIndex(o => o.id === orderId);
        if (idx !== -1) {
            orders[idx].status = status;
            setLocalOrders(orders);
            return { success: true, data: orders[idx], source: 'local' };
        }
        return { success: false, error: "Order not found" };
    },

    // Delete order
    async deleteOrder(orderId) {
        if (supabaseClient) {
            try {
                const { error } = await supabaseClient
                    .from('orders')
                    .delete()
                    .eq('id', orderId);

                if (!error) {
                    return { success: true, source: 'supabase' };
                }
            } catch (err) {
                console.warn("Supabase order delete error:", err);
            }
        }

        const orders = getLocalOrders();
        const filtered = orders.filter(o => o.id !== orderId);
        setLocalOrders(filtered);
        return { success: true, source: 'local' };
    }
};

window.dbService = dbService;
window.DEFAULT_BOOKS = DEFAULT_BOOKS;
window.SUPABASE_CONFIG = {
    URL: SUPABASE_URL,
    ANON_KEY: SUPABASE_ANON_KEY
};
