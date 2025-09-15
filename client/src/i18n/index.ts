import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';

// Translation resources
const resources = {
  en: {
    translation: {
      // Navigation
      nav: {
        shop: "Shop",
        products: "Products", 
        services: "Services",
        contact: "Contact",
        cart: "Cart",
        login: "Login",
        logout: "Logout",
        admin: "Admin"
      },
      
      // Shop Page
      shop: {
        title: "Car Audio Shop",
        subtitle: "Discover our complete range of premium car audio products for the ultimate driving experience",
        categories: {
          speakers: "Speakers",
          amplifiers: "Amplifiers", 
          headUnits: "Head Units",
          accessories: "Accessories"
        },
        categoryDescriptions: {
          speakers: "Premium sound",
          amplifiers: "Pure power", 
          headUnits: "Smart control",
          accessories: "Complete setup"
        },
        filters: {
          category: "Category",
          brand: "Brand",
          vehicleMake: "Vehicle Make",
          model: "Model", 
          year: "Year",
          priceRange: "Price Range",
          sort: "Sort",
          clearFilters: "Clear Filters",
          showFilters: "Show Filters",
          hideFilters: "Hide Filters"
        },
        sorting: {
          name: "Name A-Z",
          priceLow: "Price Low-High",
          priceHigh: "Price High-Low", 
          newest: "Newest First",
          featured: "Featured First"
        },
        placeholders: {
          allCategories: "All categories",
          allBrands: "All brands",
          allMakes: "All makes", 
          allModels: "All models",
          allYears: "All years",
          searchProducts: "Search products..."
        },
        results: {
          found: "products found",
          noResults: "No products found",
          loading: "Loading..."
        },
        viewMode: {
          grid: "Grid",
          list: "List",
          view: "View"
        }
      },
      
      // Product Details
      product: {
        addToCart: "Add to Cart",
        price: "Price", 
        description: "Description",
        specifications: "Specifications",
        compatibility: "Vehicle Compatibility",
        inStock: "In Stock",
        outOfStock: "Out of Stock",
        quantity: "Quantity",
        features: "Features",
        reviews: "Reviews",
        related: "Related Products"
      },
      
      // Cart
      cart: {
        title: "Shopping Cart", 
        empty: "Your cart is empty",
        total: "Total",
        subtotal: "Subtotal",
        shipping: "Shipping",
        checkout: "Proceed to Checkout",
        remove: "Remove",
        update: "Update",
        continue: "Continue Shopping"
      },
      
      // Forms
      forms: {
        submit: "Submit",
        cancel: "Cancel", 
        save: "Save",
        delete: "Delete",
        edit: "Edit",
        add: "Add",
        search: "Search",
        filter: "Filter",
        reset: "Reset"
      },
      
      // Common
      common: {
        loading: "Loading...",
        error: "An error occurred",
        success: "Success!",
        confirm: "Are you sure?",
        yes: "Yes", 
        no: "No",
        ok: "OK",
        close: "Close"
      }
    }
  },
  nl: {
    translation: {
      // Navigation  
      nav: {
        shop: "Shop",
        products: "Producten",
        services: "Diensten", 
        contact: "Contact",
        cart: "Winkelwagen",
        login: "Inloggen",
        logout: "Uitloggen",
        admin: "Beheer"
      },
      
      // Shop Page
      shop: {
        title: "Car Audio Shop",
        subtitle: "Ontdek ons complete assortiment premium car audio producten voor de ultieme rijervaring",
        categories: {
          speakers: "Speakers",
          amplifiers: "Versterkers",
          headUnits: "Head Units", 
          accessories: "Accessoires"
        },
        categoryDescriptions: {
          speakers: "Premium geluid",
          amplifiers: "Pure kracht",
          headUnits: "Slimme bediening", 
          accessories: "Complete setup"
        },
        filters: {
          category: "Categorie",
          brand: "Merk",
          vehicleMake: "Voertuigmerk",
          model: "Model",
          year: "Bouwjaar", 
          priceRange: "Prijsbereik",
          sort: "Sorteren",
          clearFilters: "Filters Wissen",
          showFilters: "Filters Tonen",
          hideFilters: "Filters Verbergen"
        },
        sorting: {
          name: "Naam A-Z",
          priceLow: "Prijs laag-hoog",
          priceHigh: "Prijs hoog-laag",
          newest: "Nieuwste eerst", 
          featured: "Uitgelicht eerst"
        },
        placeholders: {
          allCategories: "Alle categorieën",
          allBrands: "Alle merken",
          allMakes: "Alle merken",
          allModels: "Alle modellen",
          allYears: "Alle jaren",
          searchProducts: "Zoek producten..."
        },
        results: {
          found: "producten gevonden", 
          noResults: "Geen producten gevonden",
          loading: "Laden..."
        },
        viewMode: {
          grid: "Raster",
          list: "Lijst",
          view: "Weergave"
        }
      },
      
      // Product Details
      product: {
        addToCart: "Toevoegen aan Winkelwagen",
        price: "Prijs",
        description: "Beschrijving", 
        specifications: "Specificaties",
        compatibility: "Voertuig Compatibiliteit",
        inStock: "Op Voorraad",
        outOfStock: "Niet Op Voorraad",
        quantity: "Aantal",
        features: "Kenmerken",
        reviews: "Reviews",
        related: "Gerelateerde Producten"
      },
      
      // Cart
      cart: {
        title: "Winkelwagen",
        empty: "Je winkelwagen is leeg", 
        total: "Totaal",
        subtotal: "Subtotaal",
        shipping: "Verzending",
        checkout: "Afrekenen",
        remove: "Verwijderen",
        update: "Bijwerken",
        continue: "Verder Winkelen"
      },
      
      // Forms
      forms: {
        submit: "Verzenden",
        cancel: "Annuleren",
        save: "Opslaan", 
        delete: "Verwijderen",
        edit: "Bewerken",
        add: "Toevoegen",
        search: "Zoeken",
        filter: "Filteren",
        reset: "Reset"
      },
      
      // Common
      common: {
        loading: "Laden...",
        error: "Er is een fout opgetreden", 
        success: "Succes!",
        confirm: "Weet je het zeker?",
        yes: "Ja",
        no: "Nee",
        ok: "OK",
        close: "Sluiten"
      }
    }
  }
};

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources,
    fallbackLng: 'nl', // Default to Dutch for Car Audio Limburg
    debug: false,
    
    detection: {
      order: ['localStorage', 'navigator'],
      caches: ['localStorage']
    },
    
    interpolation: {
      escapeValue: false
    }
  });

export default i18n;