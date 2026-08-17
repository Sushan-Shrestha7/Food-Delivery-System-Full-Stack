import { NestFactory } from "@nestjs/core";
import { AppModule } from "./app.module";
import { getRepositoryToken } from "@nestjs/typeorm";
import { Product } from "./products/entities/product.entity";

const products = [
  {
    name: "Veg salad",
    imageUrl: "food_2.png",
    price: 220,
    category: "Salad",
    description:
      "Fresh seasonal vegetables tossed in a light lemon and olive oil dressing",
  },
  {
    name: "Clover Salad",
    imageUrl: "food_3.png",
    price: 260,
    category: "Salad",
    description:
      "Crisp mixed greens with toasted walnuts and a tangy vinaigrette",
  },
  {
    name: "Chicken Salad",
    imageUrl: "food_4.png",
    price: 320,
    category: "Salad",
    description:
      "Grilled chicken breast over mixed greens with a herb yogurt dressing",
  },

  // Rolls
  {
    name: "Lasagna Rolls",
    imageUrl: "food_5.png",
    price: 280,
    category: "Rolls",
    description:
      "Rolled pasta sheets filled with cheese and minced meat, baked in tomato sauce",
  },
  {
    name: "Peri Peri Rolls",
    imageUrl: "food_6.png",
    price: 220,
    category: "Rolls",
    description:
      "Spicy peri-peri chicken wrapped in a soft flatbread with pickled onions",
  },
  {
    name: "Chicken Rolls",
    imageUrl: "food_7.png",
    price: 240,
    category: "Rolls",
    description:
      "Shredded chicken with fresh vegetables wrapped in a warm paratha",
  },
  {
    name: "Veg Rolls",
    imageUrl: "food_8.png",
    price: 180,
    category: "Rolls",
    description:
      "Crispy mixed-vegetable filling wrapped and lightly fried until golden",
  },

  // Deserts
  {
    name: "Ripple Ice Cream",
    imageUrl: "food_9.png",
    price: 150,
    category: "Deserts",
    description:
      "Creamy vanilla ice cream swirled with a fruit and berry ripple",
  },
  {
    name: "Fruit Ice Cream",
    imageUrl: "food_10.png",
    price: 180,
    category: "Deserts",
    description:
      "Mixed fresh seasonal fruit blended into a smooth chilled scoop",
  },
  {
    name: "Jar Ice Cream",
    imageUrl: "food_11.png",
    price: 200,
    category: "Deserts",
    description:
      "Layered ice cream served in a jar with crushed cookies and toppings",
  },
  {
    name: "Vanilla Ice Cream",
    imageUrl: "food_12.png",
    price: 120,
    category: "Deserts",
    description:
      "Classic rich and creamy vanilla ice cream made with real vanilla bean",
  },

  // Sandwich
  {
    name: "Chicken Sandwich",
    imageUrl: "food_13.png",
    price: 250,
    category: "Sandwich",
    description:
      "Grilled chicken breast with lettuce, tomato, and mayo on toasted bread",
  },
  {
    name: "Vegan Sandwich",
    imageUrl: "food_14.png",
    price: 220,
    category: "Sandwich",
    description: "Plant-based patty with fresh vegetables and a vegan spread",
  },
  {
    name: "Grilled Sandwich",
    imageUrl: "food_15.png",
    price: 200,
    category: "Sandwich",
    description:
      "Toasted sandwich filled with melted cheese and grilled vegetables",
  },
  {
    name: "Bread Sandwich",
    imageUrl: "food_16.png",
    price: 180,
    category: "Sandwich",
    description:
      "Soft bread layered with fresh vegetables, chutney, and spices",
  },

  // Cake
  {
    name: "Cup Cake",
    imageUrl: "food_17.png",
    price: 150,
    category: "Cake",
    description:
      "Soft vanilla cupcake topped with buttercream frosting and sprinkles",
  },
  {
    name: "Vegan Cake",
    imageUrl: "food_18.png",
    price: 220,
    category: "Cake",
    description: "Dairy-free chocolate cake made with plant-based ingredients",
  },
  {
    name: "Butterscotch Cake",
    imageUrl: "food_19.png",
    price: 350,
    category: "Cake",
    description: "Rich butterscotch sponge layered with caramel cream and nuts",
  },
  {
    name: "Sliced Cake",
    imageUrl: "food_20.png",
    price: 250,
    category: "Cake",
    description: "Classic vanilla sponge cake sliced and served fresh",
  },

  // Pure Veg
  {
    name: "Garlic Mushroom",
    imageUrl: "food_21.png",
    price: 240,
    category: "Pure Veg",
    description: "Sauteed mushrooms tossed in garlic butter and fresh herbs",
  },
  {
    name: "Fried Cauliflower",
    imageUrl: "food_22.png",
    price: 200,
    category: "Pure Veg",
    description: "Crispy battered cauliflower florets served with a spicy dip",
  },
  {
    name: "Mix Veg Pulao",
    imageUrl: "food_23.png",
    price: 220,
    category: "Pure Veg",
    description:
      "Fragrant basmati rice cooked with mixed vegetables and whole spices",
  },
  {
    name: "Rice Zucchini",
    imageUrl: "food_24.png",
    price: 200,
    category: "Pure Veg",
    description:
      "Steamed rice served with sauteed zucchini, herbs, and a soft egg",
  },

  // Pasta
  {
    name: "Cheese Pasta",
    imageUrl: "food_25.png",
    price: 320,
    category: "Pasta",
    description: "Penne pasta tossed in a rich, gooey cheese sauce",
  },
  {
    name: "Tomato Pasta",
    imageUrl: "food_26.png",
    price: 300,
    category: "Pasta",
    description: "Pasta in a classic tomato and basil sauce with parmesan",
  },
  {
    name: "Creamy Pasta",
    imageUrl: "food_27.png",
    price: 350,
    category: "Pasta",
    description: "Pasta tossed in a creamy garlic parmesan sauce",
  },
  {
    name: "Chicken Pasta",
    imageUrl: "food_28.png",
    price: 420,
    category: "Pasta",
    description: "Pasta with grilled chicken strips in a creamy herb sauce",
  },

  // Noodles
  {
    name: "Butter Noodles",
    imageUrl: "food_29.png",
    price: 220,
    category: "Noodles",
    description: "Stir-fried noodles tossed in butter, garlic, and fresh herbs",
  },
  {
    name: "Veg Noodles",
    imageUrl: "food_30.png",
    price: 180,
    category: "Noodles",
    description: "Classic vegetable chowmein stir-fried with soy sauce",
  },
  {
    name: "Somen Noodles",
    imageUrl: "food_31.png",
    price: 250,
    category: "Noodles",
    description:
      "Thin wheat noodles stir-fried with fresh vegetables and sesame oil",
  },
  {
    name: "Cooked Noodles",
    imageUrl: "food_32.png",
    price: 200,
    category: "Noodles",
    description: "Soft boiled noodles served in a light vegetable broth",
  },

  // Momo
  {
    name: "Steam Momo",
    imageUrl: "momo_1.png",
    price: 180,
    category: "Momo",
    description:
      "Traditional steamed dumplings filled with spiced minced meat and herbs",
  },
  {
    name: "Jhol Momo",
    imageUrl: "jhol_momo.png",
    price: 220,
    category: "Momo",
    description: "Steamed momos served in a tangy, spiced sesame-tomato broth",
  },
];

async function seed() {
  const app = await NestFactory.createApplicationContext(AppModule);
  const productRepo = app.get(getRepositoryToken(Product));

  try {
    await productRepo.clear();
  } catch (err) {
    console.warn(
      "productRepo.clear() failed (likely a foreign key constraint from existing orders). " +
        "Falling back to delete-all instead.",
    );
    await productRepo.createQueryBuilder().delete().from(Product).execute();
  }

  for (const p of products) {
    await productRepo.save(
      productRepo.create({
        ...p,
        stock: 50,
      }),
    );
  }

  console.log(`Seeded ${products.length} products.`);
  await app.close();
}

seed();
