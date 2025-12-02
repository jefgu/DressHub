import mongoose from "mongoose";
import dotenv from "dotenv";
import bcrypt from "bcrypt";
import { User } from "./models/User";
import { Item } from "./models/Item";

dotenv.config();

const MONGO_URI = process.env.MONGO_URI || "mongodb://localhost:27017/dress_hub";

const mockItems = [
  // Formal Dresses
  {
    title: "Elegant Blue Evening Gown",
    description: "Floor-length blue evening gown with elegant silhouette. Features satin finish and sophisticated styling. Perfect for galas, formal weddings, and blue-tie events.",
    category: "dress",
    size: "M",
    genderTarget: "female",
    dailyPrice: 55.00,
    depositAmount: 250.00,
    condition: "Excellent",
    images: ["https://images.unsplash.com/photo-1539008835657-9e8e9680c956?w=400&h=600&fit=crop"],
  },
  {
    title: "Flowing Red Evening Dress",
    description: "Stunning red evening dress with flowing fabric and elegant drape. Floor-length with flattering silhouette. Ideal for formal events and special occasions.",
    category: "dress",
    size: "S",
    genderTarget: "female",
    dailyPrice: 65.00,
    depositAmount: 300.00,
    condition: "Excellent",
    images: ["https://images.unsplash.com/photo-1595777457583-95e059d581b8?w=400&h=600&fit=crop"],
  },
  {
    title: "Burgundy Cocktail Dress",
    description: "Knee-length burgundy cocktail dress with fitted silhouette. Perfect for weddings, holiday parties, and evening events. Elegant and timeless.",
    category: "dress",
    size: "M",
    genderTarget: "female",
    dailyPrice: 38.00,
    depositAmount: 150.00,
    condition: "Excellent",
    images: ["https://images.unsplash.com/photo-1566174053879-31528523f8ae?w=400&h=600&fit=crop"],
  },
  {
    title: "White Summer Dress",
    description: "Light and airy white dress perfect for daytime events. Knee-length with comfortable fit. Ideal for garden parties, brunches, and outdoor weddings.",
    category: "dress",
    size: "L",
    genderTarget: "female",
    dailyPrice: 42.00,
    depositAmount: 180.00,
    condition: "Excellent",
    images: ["https://images.unsplash.com/photo-1515372039744-b8f02a3ae446?w=400&h=600&fit=crop"],
  },
  {
    title: "White Lace Wedding Dress",
    description: "Beautiful white lace wedding or formal dress with intricate details. Floor-length with romantic styling. Perfect for brides and special formal occasions.",
    category: "dress",
    size: "S",
    genderTarget: "female",
    dailyPrice: 85.00,
    depositAmount: 400.00,
    condition: "Excellent",
    images: ["https://images.unsplash.com/photo-1519657337289-077653f724ed?w=400&h=600&fit=crop"],
  },
  {
    title: "Designer Denim Dress",
    description: "Sophisticated denim dress with modern cut. Versatile and stylish.",
    category: "dress",
    size: "M",
    genderTarget: "female",
    dailyPrice: 38.00,
    depositAmount: 180.00,
    condition: "Excellent",
    images: ["https://images.unsplash.com/photo-1591369822096-ffd140ec948f?w=400&h=600&fit=crop"],
  },

  // Men's Suits
  {
    title: "Classic Black Tuxedo",
    description: "Premium black tuxedo with satin lapels, jacket, and trousers. Includes bow tie. Perfect for weddings, galas, and black-tie events.",
    category: "suit",
    size: "L",
    genderTarget: "male",
    dailyPrice: 75.00,
    depositAmount: 400.00,
    condition: "Excellent",
    images: ["https://images.unsplash.com/photo-1617127365659-c47fa864d8bc?w=400&h=600&fit=crop"],
  },
  {
    title: "Charcoal Grey Business Suit",
    description: "Professional charcoal grey suit including jacket and trousers. Modern fit. Ideal for business meetings, interviews, and formal events.",
    category: "suit",
    size: "M",
    genderTarget: "male",
    dailyPrice: 58.00,
    depositAmount: 280.00,
    condition: "Excellent",
    images: ["https://images.unsplash.com/photo-1507679799987-c73779587ccf?w=400&h=600&fit=crop"],
  },
  {
    title: "Navy Blue Wedding Suit",
    description: "Modern navy blue suit with slim fit. Includes jacket and trousers. Perfect for weddings, formal dinners, and special occasions.",
    category: "suit",
    size: "L",
    genderTarget: "male",
    dailyPrice: 62.00,
    depositAmount: 300.00,
    condition: "Excellent",
    images: ["https://images.unsplash.com/photo-1594938298603-c8148c4dae35?w=400&h=600&fit=crop"],
  },
 
  // Jackets
  {
    title: "Black Leather Biker Jacket",
    description: "Classic black leather motorcycle jacket with authentic styling. Genuine leather with quality hardware. Perfect for adding edge to any outfit.",
    category: "jacket",
    size: "M",
    genderTarget: "male",
    dailyPrice: 35.00,
    depositAmount: 200.00,
    condition: "Very Good",
    images: ["https://images.unsplash.com/photo-1551028719-00167b16eac5?w=400&h=600&fit=crop"],
  },
  {
    title: "Camel Leather Coat",
    description: "Elegant camel-colored leather coat with classic styling. Perfect for fall and winter events. Timeless piece for any wardrobe.",
    category: "jacket",
    size: "L",
    genderTarget: "unisex",
    dailyPrice: 42.00,
    depositAmount: 220.00,
    condition: "Excellent",
    images: ["https://images.unsplash.com/photo-1539533018447-63fcce2678e3?w=400&h=600&fit=crop"],
  },
];

async function seedDatabase() {
  try {
    await mongoose.connect(MONGO_URI);
    console.log("Connected to MongoDB");

    // Clear existing data
    await Item.deleteMany({});
    console.log("Cleared existing items");

    // Create or find a default owner user
    let owner = await User.findOne({ email: "owner@dresshub.com" });
    
    if (!owner) {
      const passwordHash = await bcrypt.hash("password123", 10);
      owner = await User.create({
        name: "DressHub Owner",
        email: "owner@dresshub.com",
        passwordHash,
      });
      console.log("Created default owner user");
    }

    // Create items
    const itemsToInsert = mockItems.map(item => ({
      ...item,
      owner: owner!._id,
      available: true,
    }));

    await Item.insertMany(itemsToInsert);
    console.log(`✅ Successfully seeded ${mockItems.length} items!`);

    // Display summary
    const summary = await Item.aggregate([
      { $group: { _id: "$category", count: { $sum: 1 } } },
      { $sort: { _id: 1 } },
    ]);

    console.log("\n📊 Items by category:");
    summary.forEach(({ _id, count }) => {
      console.log(`  - ${_id}: ${count} items`);
    });

    console.log("\n🎉 Database seeding complete!");
    
  } catch (error) {
    console.error("Error seeding database:", error);
  } finally {
    await mongoose.disconnect();
    console.log("Disconnected from MongoDB");
  }
}

seedDatabase();

