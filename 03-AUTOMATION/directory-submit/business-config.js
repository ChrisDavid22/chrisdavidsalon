/**
 * Chris David Salon - Business Configuration
 * This file contains all verified NAP data for directory submissions
 */

export const BUSINESS = {
  // Core NAP (Name, Address, Phone)
  name: "Chris David Salon",
  streetAddress: "1878C Dr Andres Way",
  city: "Delray Beach",
  state: "Florida",
  stateCode: "FL",
  zip: "33445",
  country: "United States",
  countryCode: "US",
  phone: "(561) 299-0950",
  phoneClean: "5612990950",
  phoneInternational: "+15612990950",

  // Online Presence
  website: "https://www.chrisdavidsalon.com",
  email: "chrisdavidsalon@gmail.com",

  // Social Media
  social: {
    instagram: "https://www.instagram.com/chrisdavidsalon/",
    instagramHandle: "@chrisdavidsalon",
    facebook: "https://www.facebook.com/ChrisDavidSalon",
    facebookHandle: "ChrisDavidSalon"
  },

  // Business Details
  established: "2017",
  openingDate: "June 2017",

  // Categories
  primaryCategory: "Hair Salon",
  categories: [
    "Hair Salon",
    "Beauty Salon",
    "Stylist",
    "Hairdresser",
    "Hair Colorist",
    "Balayage Specialist"
  ],

  // Hours (matching GBP exactly)
  hours: {
    sunday: { open: false, hours: "Closed" },
    monday: { open: false, hours: "Closed" },
    tuesday: { open: true, hours: "11:00 AM - 6:00 PM", openTime: "11:00", closeTime: "18:00" },
    wednesday: { open: true, hours: "11:00 AM - 6:00 PM", openTime: "11:00", closeTime: "18:00" },
    thursday: { open: true, hours: "11:00 AM - 6:00 PM", openTime: "11:00", closeTime: "18:00" },
    friday: { open: true, hours: "11:00 AM - 6:00 PM", openTime: "11:00", closeTime: "18:00" },
    saturday: { open: true, hours: "11:00 AM - 6:00 PM", openTime: "11:00", closeTime: "18:00" }
  },

  // Attributes
  attributes: {
    veteranOwned: true,
    wheelchairAccessible: true,
    wheelchairAccessibleParking: true,
    wheelchairAccessibleEntrance: true,
    wheelchairAccessibleRestroom: true,
    hasRestroom: true,
    freeWifi: true,
    lgbtqFriendly: true,
    transgenderSafespace: true
  },

  // Descriptions
  descriptions: {
    short: "Chris David Salon is a premier hair color studio in Delray Beach's Andre Design District. Specializing in balayage, color correction, and hair extensions with 20+ years expertise. Certified Davines salon. Rated 4.9 stars. \"Hair is the art you wear.\"",

    medium: "Chris David Salon personalizes the salon experience by offering unique haircuts and artistically inspired colors designed to suit your style. Located in the prestigious Andre Design District, owner Chris David brings 20+ years of expertise with certifications from Davines, Goldwell, Organic Color Systems, Platinum Seamless, and Cezanne. We believe \"Hair is the art you wear.\" Veteran-owned. Serving Delray Beach, Boca Raton, and Palm Beach County since 2017.",

    long: `Chris David Salon personalizes the salon experience by offering unique haircuts and artistically inspired colors designed to suit your style. Located in the prestigious Andre Design District, owner Chris David brings 20+ years of expertise with certifications from 5 major brands including Davines, Goldwell, Organic Color Systems, Platinum Seamless, and Cezanne.

We specialize in:
• Balayage & Highlights
• Color Correction
• Hair Extensions
• Precision Haircuts
• Keratin Treatments

Chris David Salon uses Davines for a natural, sustainable approach to hair care. We believe "Hair is the art you wear" and invite you to experience a different approach to beauty.

Veteran-owned. Wheelchair accessible. Free Wi-Fi. LGBTQ+ friendly.

Serving Delray Beach, Boca Raton, Boynton Beach, and Palm Beach County since 2017.`
  },

  // Services & Pricing
  services: [
    { name: "Women's Precision Cut", price: "$75+", category: "Haircuts" },
    { name: "Men's Precision Cut", price: "$45+", category: "Haircuts" },
    { name: "Balayage", price: "$200+", category: "Color" },
    { name: "Full Color", price: "$150+", category: "Color" },
    { name: "Color Correction", price: "$300+", category: "Color" },
    { name: "Hair Extensions", price: "$300+", category: "Extensions" },
    { name: "Keratin Treatment", price: "$200+", category: "Treatments" },
    { name: "Blowout", price: "$50+", category: "Styling" }
  ],

  // Service Areas
  serviceAreas: [
    "Delray Beach",
    "Boca Raton",
    "Boynton Beach",
    "Palm Beach County",
    "Highland Beach",
    "Gulf Stream",
    "Ocean Ridge",
    "Lake Worth"
  ],

  // Credentials
  credentials: [
    "Davines Certified",
    "Goldwell Academy Graduate",
    "Organic Color Systems Certified",
    "Platinum Seamless Certified",
    "Cezanne Certified",
    "20+ Years Experience",
    "Master Colorist"
  ],

  // Rating Info (from GBP)
  rating: {
    score: 4.9,
    reviewCount: 140,
    platform: "Google"
  },

  // Existing Listings (verified)
  existingListings: {
    google: { listed: true, verified: true, url: "https://business.google.com" },
    yelp: { listed: true, verified: false, url: "https://www.yelp.com/biz/chris-david-salon-delray-beach-3" },
    nextdoor: { listed: true, verified: true, url: "https://nextdoor.com/pages/chris-david-salon-delray-beach-fl/" },
    facebook: { listed: true, verified: false, url: "https://www.facebook.com/ChrisDavidSalon" },
    instagram: { listed: true, verified: true, url: "https://www.instagram.com/chrisdavidsalon/" },
    waze: { listed: true, verified: false, url: null },
    classpass: { listed: true, verified: false, url: "https://classpass.com/studios/chris-david-salon-delray-beach" }
  },

  // Target Listings (gaps to fill)
  targetListings: [
    { name: "Bing Places", priority: 1, url: "https://www.bingplaces.com", method: "import_google" },
    { name: "Apple Business Connect", priority: 2, url: "https://businessconnect.apple.com", method: "claim" },
    { name: "Foursquare", priority: 3, url: "https://foursquare.com/business/claim", method: "claim" },
    { name: "Yellow Pages", priority: 4, url: "https://www.yp.com", method: "create" },
    { name: "Manta", priority: 5, url: "https://www.manta.com/claim", method: "claim" },
    { name: "MapQuest", priority: 6, url: "https://www.mapquest.com/my-business", method: "create" },
    { name: "SuperPages", priority: 7, url: "https://www.superpages.com", method: "create" },
    { name: "Hotfrog", priority: 8, url: "https://www.hotfrog.com/add-business", method: "create" }
  ]
};

// Helper function to get full address string
export function getFullAddress() {
  return `${BUSINESS.streetAddress}, ${BUSINESS.city}, ${BUSINESS.stateCode} ${BUSINESS.zip}`;
}

// Helper function to format hours for different platforms
export function formatHours(format = 'standard') {
  const days = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];

  if (format === 'array') {
    return days.map(day => ({
      day: day.charAt(0).toUpperCase() + day.slice(1),
      ...BUSINESS.hours[day]
    }));
  }

  return BUSINESS.hours;
}

export default BUSINESS;
