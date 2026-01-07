/**
 * Centralized UI Content
 * All UI text is centralized here for easy updates and future i18n support
 */

export const APP_CONTENT = {
  brand: {
    name: 'SN Auto Parts',
    tagline: 'Quality Parts. Guaranteed Fitment.',
    description: 'Your trusted source for premium auto parts and accessories.',
    phone: '(555) 123-4567',
    email: 'support@snautoparts.com',
    address: '123 Auto Drive, Detroit, MI 48201',
  },

  navigation: {
    home: 'Home',
    products: 'Products',
    categories: 'Categories',
    deals: 'Deals',
    cart: 'Cart',
    orders: 'My Orders',
    profile: 'Profile',
    addresses: 'Addresses',
    vehicles: 'My Vehicles',
    logout: 'Logout',
  },

  home: {
    hero: {
      title: 'Quality Auto Parts You Can Trust',
      subtitle: 'Find the perfect parts for your vehicle with our extensive catalog. Guaranteed fitment, fast shipping, and expert support.',
      ctaPrimary: 'Shop Now',
      ctaSecondary: 'View Deals',
    },
    fitment: {
      title: 'Select your vehicle for guaranteed fitment',
      yearLabel: 'Year',
      makeLabel: 'Make',
      modelLabel: 'Model',
      searchButton: 'Find Parts',
    },
    categories: {
      title: 'Shop by Category',
      viewAll: 'View all categories',
    },
    featured: {
      title: 'Featured Products',
    },
    newsletter: {
      title: 'Join the SN Auto Club',
      subtitle: 'Sign up for our newsletter to receive exclusive deals, maintenance tips, and 15% off your first order.',
      placeholder: 'Enter your email',
      button: 'Subscribe',
    },
  },

  catalog: {
    filters: {
      category: 'Category',
      brand: 'Brand',
      priceRange: 'Price Range',
      inStock: 'In Stock Only',
      fitment: 'Vehicle Fitment',
    },
    sort: {
      label: 'Sort by',
      newest: 'Newest',
      priceAsc: 'Price: Low to High',
      priceDesc: 'Price: High to Low',
      nameAsc: 'Name: A-Z',
      nameDesc: 'Name: Z-A',
    },
    results: {
      showing: 'Showing {{count}} products',
      noResults: 'No products found',
      clearFilters: 'Clear all filters',
    },
  },

  product: {
    sku: 'SKU',
    brand: 'Brand',
    price: 'Price',
    quantity: 'Quantity',
    addToCart: 'Add to Cart',
    buyNow: 'Buy Now',
    inStock: 'In Stock',
    lowStock: 'Low Stock',
    outOfStock: 'Out of Stock',
    description: 'Description',
    specifications: 'Specifications',
    fitment: 'Vehicle Fitment',
    reviews: 'Reviews',
  },

  cart: {
    title: 'Shopping Cart',
    empty: 'Your cart is empty',
    continueShopping: 'Continue Shopping',
    subtotal: 'Subtotal',
    shipping: 'Shipping',
    tax: 'Tax',
    total: 'Total',
    checkout: 'Proceed to Checkout',
    remove: 'Remove',
    updateQuantity: 'Update quantity',
  },

  checkout: {
    steps: {
      shipping: 'Shipping',
      payment: 'Payment',
      review: 'Review',
      confirmation: 'Confirmation',
    },
    shipping: {
      title: 'Shipping Address',
      selectAddress: 'Select a saved address',
      newAddress: 'Add new address',
    },
    payment: {
      title: 'Payment Method',
      cardNumber: 'Card Number',
      expiry: 'Expiry Date',
      cvc: 'CVC',
    },
    review: {
      title: 'Review Your Order',
      placeOrder: 'Place Order',
    },
    confirmation: {
      title: 'Order Confirmed!',
      orderNumber: 'Order Number',
      thankYou: 'Thank you for your order.',
      email: 'A confirmation email has been sent to {{email}}.',
    },
  },

  auth: {
    login: {
      title: 'Welcome Back, Gearhead',
      subtitle: 'Access your order history and saved garage.',
      email: 'Email Address',
      password: 'Password',
      forgotPassword: 'Forgot Password?',
      submit: 'Secure Login',
      noAccount: "Don't have an account?",
      signUp: 'Sign up for free',
    },
    register: {
      title: 'Create an Account',
      subtitle: 'Join the SN Auto Parts family today.',
      firstName: 'First Name',
      lastName: 'Last Name',
      email: 'Email Address',
      password: 'Password',
      confirmPassword: 'Confirm Password',
      submit: 'Create Account',
      hasAccount: 'Already have an account?',
      signIn: 'Sign in',
    },
    forgotPassword: {
      title: 'Forgot Password?',
      subtitle: "Enter your email address and we'll send you a link to reset your password.",
      email: 'Email Address',
      submit: 'Send Reset Link',
      backToLogin: 'Back to Login',
      emailSentTitle: 'Check Your Email',
      emailSentSubtitle: "We've sent password reset instructions to your email address.",
    },
    resetPassword: {
      title: 'Reset Password',
      subtitle: 'Enter your new password below.',
      password: 'New Password',
      confirmPassword: 'Confirm Password',
      submit: 'Reset Password',
    },
  },

  orders: {
    title: 'My Orders',
    empty: 'No orders yet',
    orderNumber: 'Order #{{number}}',
    status: {
      PENDING: 'Pending',
      CONFIRMED: 'Confirmed',
      PROCESSING: 'Processing',
      SHIPPED: 'Shipped',
      DELIVERED: 'Delivered',
      CANCELLED: 'Cancelled',
      REFUNDED: 'Refunded',
    },
    trackOrder: 'Track Order',
    viewDetails: 'View Details',
    reorder: 'Reorder',
  },

  account: {
    profile: {
      title: 'Profile',
      firstName: 'First Name',
      lastName: 'Last Name',
      email: 'Email',
      phone: 'Phone',
      save: 'Save Changes',
    },
    addresses: {
      title: 'Addresses',
      addNew: 'Add New Address',
      edit: 'Edit',
      delete: 'Delete',
      setDefault: 'Set as Default',
      default: 'Default',
    },
    vehicles: {
      title: 'My Vehicles',
      addNew: 'Add Vehicle',
      setDefault: 'Set as Default',
      delete: 'Remove',
    },
  },

  common: {
    loading: 'Loading...',
    error: 'An error occurred',
    retry: 'Try Again',
    save: 'Save',
    cancel: 'Cancel',
    delete: 'Delete',
    edit: 'Edit',
    close: 'Close',
    back: 'Back',
    next: 'Next',
    submit: 'Submit',
    search: 'Search',
    filter: 'Filter',
    clear: 'Clear',
    apply: 'Apply',
    yes: 'Yes',
    no: 'No',
    confirm: 'Confirm',
  },

  validation: {
    required: 'This field is required',
    email: 'Please enter a valid email address',
    minLength: 'Must be at least {{min}} characters',
    maxLength: 'Must be no more than {{max}} characters',
    min: 'Must be at least {{min}}',
    max: 'Must be no more than {{max}}',
    pattern: 'Invalid format',
    phone: 'Please enter a valid phone number',
    zipCode: 'Please enter a valid ZIP code',
    passwordMismatch: 'Passwords do not match',
  },

  footer: {
    company: {
      title: 'Company',
      about: 'About Us',
      careers: 'Careers',
      locations: 'Locations',
      blog: 'Blog',
    },
    support: {
      title: 'Support',
      contact: 'Contact Us',
      returns: 'Return Policy',
      shipping: 'Shipping Info',
      track: 'Track Order',
    },
    legal: {
      title: 'Legal',
      terms: 'Terms of Service',
      privacy: 'Privacy Policy',
      cookies: 'Cookie Policy',
    },
    newsletter: {
      title: 'Stay Connected',
      subtitle: 'Subscribe for deals and updates',
    },
    copyright: '© {{year}} SN Auto Parts, Inc. All rights reserved.',
  },
} as const;

export type AppContent = typeof APP_CONTENT;
