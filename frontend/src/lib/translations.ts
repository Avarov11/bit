export type Lang = "en" | "ar";

const en: Record<string, string> = {
  // ── Navbar ───────────────────────────────────────────────
  nav_home: "Home",
  nav_menu: "Menu",
  nav_about: "About",
  nav_contact: "Contact",
  nav_lang_button: "عربي",
  nav_switch_label: "Switch to Arabic",

  // ── Hero ─────────────────────────────────────────────────
  hero_title_line1: "Biteez Gifting",
  hero_title_line2: "Bakery",
  hero_card1_title: "Curated Selections",
  hero_card1_subtitle: "Custom-gifting brownies",
  hero_card2_title: "Biteez Classics",
  hero_card2_subtitle: "Custom-sized brownies",
  hero_cta: "Customise Your Treats",
  hero_img_alt: "Biteez brownie gift box",

  // ── Footer ───────────────────────────────────────────────
  footer_tagline:
    "Premium handcrafted brownies made with love and the finest ingredients. Every bite tells a story of passion and craft.",
  footer_navigate: "Navigate",
  footer_visit: "Visit Us",
  footer_address: "123 Dessert Lane, Beirut, Lebanon",
  footer_copyright: "© 2024 Biteez. All rights reserved.",
  footer_crafted: "Crafted with love ♥",
  footer_instagram: "Instagram",
  footer_facebook: "Facebook",
  footer_tiktok: "TikTok",

  // ── Menu page ────────────────────────────────────────────
  menu_heading: "Our Menu",
  menu_subtitle: "Handcrafted for every occasion",
  menu_search_placeholder: "Search brownies & treats…",
  menu_no_results: "No results found",
  menu_no_results_hint: "Try a different search or category",
  menu_customise: "Customise",
  menu_add_to_cart: "Add to Cart",

  // ── Category labels ──────────────────────────────────────
  cat_all: "All",
  cat_customized: "Customized",
  cat_birthday: "Birthday",
  cat_congrats: "Congrats",
  cat_graduation: "Graduation",
  cat_get_well_soon: "Get Well Soon",
  cat_bride_to_be: "Bride to Be",
  cat_gender_reveal: "Gender Reveal",

  // ── Cart page ────────────────────────────────────────────
  cart_empty_title: "Your cart is empty",
  cart_empty_desc:
    "Looks like you haven't added anything yet. Explore our menu and build your perfect order.",
  cart_browse_menu: "Browse Menu",
  cart_title: "My Cart",
  cart_your_items: "Your Items",
  cart_clear_all: "Clear all",
  cart_continue_shopping: "Continue Shopping",
  cart_order_summary: "Order Summary",
  cart_subtotal: "Subtotal",
  cart_delivery: "Delivery",
  cart_pickup_only: "Pickup only",
  cart_total: "Total",
  cart_freshness_note:
    "All brownies are baked fresh and ready for pickup at our boutique within 24–48 hours.",
  cart_checkout_btn: "Proceed to Checkout",
  cart_customization_shape: "Shape",
  cart_customization_flavor: "Flavor",
  cart_customization_color: "Color",

  // ── Checkout page ────────────────────────────────────────
  checkout_title: "Checkout",
  checkout_subtitle: "Review and confirm your order",
  checkout_empty: "Your cart is empty",
  checkout_browse_menu: "Browse the menu →",
  checkout_contact_section: "Contact Information",
  checkout_full_name: "Full Name",
  checkout_phone: "Phone Number",
  checkout_email: "Email Address",
  checkout_pickup_section: "Pickup Details",
  checkout_boutique_name: "Biteez Boutique",
  checkout_address: "123 Dessert Lane, Beirut, Lebanon",
  checkout_hours: "Open daily · 9:00 AM – 9:00 PM",
  checkout_pickup_date: "Pickup Date",
  checkout_pickup_time: "Pickup Time",
  checkout_payment_section: "Payment Method",
  checkout_payment_note:
    "Payment is collected at pickup — no online payment required.",
  checkout_cash_pickup: "Cash on Pickup",
  checkout_card_pickup: "Card on Pickup",
  checkout_notes_section: "Order Notes",
  checkout_special_requests: "Special Requests (optional)",
  checkout_notes_placeholder:
    "Allergies, special packaging, decoration requests…",
  checkout_order_summary: "Order Summary",
  checkout_subtotal: "Subtotal",
  checkout_delivery_free: "Pickup · Free",
  checkout_total: "Total",
  checkout_placing: "Placing Order…",
  checkout_place_order: "Place Order",
  checkout_terms:
    "By placing your order you agree to our terms and conditions",
  checkout_error_name: "Full name is required",
  checkout_error_phone: "Phone number is required",
  checkout_error_email: "Valid email required",
  checkout_error_pickup_date: "Please choose a pickup date",
  checkout_error_pickup_time: "Please choose a pickup time",
  checkout_name_placeholder: "Sarah Al-Khatib",
  checkout_phone_placeholder: "+961 70 000 000",
  checkout_email_placeholder: "sarah@email.com",

  // ── Time slots ───────────────────────────────────────────
  timeslot_0: "10:00 AM – 12:00 PM",
  timeslot_1: "12:00 PM – 2:00 PM",
  timeslot_2: "2:00 PM – 5:00 PM",
  timeslot_3: "5:00 PM – 8:00 PM",

  // ── Checkout success ─────────────────────────────────────
  success_order_confirmed: "Order Confirmed",
  success_heading_prefix: "Thank you,",
  success_message:
    "Your order has been received and our team is already getting started. We'll have it fresh and ready for pickup.",
  success_order_number: "Order Number",
  success_pickup_location: "Pickup Location",
  success_boutique_name: "Biteez Boutique",
  success_address: "123 Dessert Lane, Beirut, Lebanon",
  success_pickup_time: "Pickup Time",
  success_email_note:
    "A confirmation will be sent to your email. For any changes call us at",
  success_back_home: "Back to Home",
  success_order_again: "Order Again",

  // ── Product page ─────────────────────────────────────────
  product_not_found: "Product not found",
  product_back_to_menu: "Back to menu →",
  product_price_per_box: "Price per box",
  product_quantity: "Quantity",
  product_total: "Total",
  product_add_to_cart: "Add to Cart",
  product_adding: "Adding to Cart…",
  product_freshness_note:
    "🍫 Baked fresh — ready for pickup in 24–48 hours",

  // ── Customize page – step labels ─────────────────────────
  customize_step_shape: "Shape",
  customize_step_flavor: "Flavor",
  customize_step_color: "Color",
  customize_step_toppings: "Toppings",
  customize_step_write: "Write & Print",
  customize_total_label: "Total",
  customize_next: "Next  →",
  customize_confirm: "Confirm Order",
  customize_preview_alt: "Brownie preview",

  // ── Customize – shape step ───────────────────────────────
  customize_shape_title: "Choose Size & Style",
  customize_shape_subtitle: "Select the perfect box size for your occasion",

  // ── Customize – flavor step ──────────────────────────────
  customize_flavor_title: "Choose Flavor",
  customize_flavor_subtitle: "Pick the taste that makes every bite count",
  customize_flavor_included: "Included",

  // ── Customize – color step ───────────────────────────────
  customize_color_title: "Choose Color",
  customize_color_subtitle: "Select the frosting color for your brownies",

  // ── Customize – toppings step ────────────────────────────
  customize_toppings_title: "Choose Toppings",
  customize_toppings_subtitle:
    "Select as many as you like — each adds to your total",
  customize_toppings_search_placeholder: "Search toppings…",
  customize_toppings_no_results: "No toppings match your search",

  // ── Topping categories ───────────────────────────────────
  topping_cat_all: "All",
  topping_cat_fruits: "Fruits",
  topping_cat_flowers: "Flowers",
  topping_cat_chocolate: "Chocolate",
  topping_cat_sprinkles: "Sprinkles",
  topping_cat_nuts: "Nuts",

  // ── Customize – write step ───────────────────────────────
  customize_write_title: "Write & Print",
  customize_write_subtitle: "Add a personalised message · +10 QAR",
  customize_message_label: "Your Message",
  customize_message_placeholder: "e.g. Happy Birthday Sarah! 🎂",
  customize_font_style_label: "Font Style",
  customize_placement_label: "Message Placement",

  // ── Shape names & servings ───────────────────────────────
  shape_name_mini: "Mini Box",
  shape_name_small_standard: "Small Box",
  shape_name_small_heart: "Heart Box",
  shape_name_standard: "Standard Box",
  shape_name_large_box: "Large Box",
  shape_name_party_tray: "Party Tray",
  shape_serving_mini: "Good for 2–4 people",
  shape_serving_small_standard: "Good for 5–8 people",
  shape_serving_small_heart: "Good for 5–8 people",
  shape_serving_standard: "Good for 12–16 people",
  shape_serving_large_box: "Good for 20–25 people",
  shape_serving_party_tray: "Good for 30+ people",

  // ── Flavor names & descriptions ──────────────────────────
  flavor_name_vanilla: "Vanilla Blondie",
  flavor_name_red_velvet: "Red Velvet",
  flavor_name_chocolate: "Chocolate Fudge",
  flavor_name_pistachio: "Pistachio Rose",
  flavor_name_lemon: "Lemon Blondie",
  flavor_name_caramel: "Salted Caramel",
  flavor_name_strawberry: "Strawberry Swirl",
  flavor_name_matcha: "Matcha Blondie",
  flavor_desc_vanilla: "Chewy blondie base with Madagascar vanilla bean",
  flavor_desc_red_velvet: "Velvety cocoa brownie swirled with cream cheese",
  flavor_desc_chocolate:
    "Double-chocolate brownie with Belgian dark chips",
  flavor_desc_pistachio:
    "Blondie with Iranian pistachio cream & rose water",
  flavor_desc_lemon: "Zesty blondie with Sicilian lemon curd swirl",
  flavor_desc_caramel: "Gooey caramel brownie topped with fleur de sel",
  flavor_desc_strawberry:
    "White chocolate brownie with fresh strawberry jam",
  flavor_desc_matcha:
    "Earthy blondie base with ceremonial matcha swirl",

  // ── Color names ──────────────────────────────────────────
  color_name_white: "White",
  color_name_ivory: "Ivory",
  color_name_cream: "Cream",
  color_name_blush: "Blush Pink",
  color_name_rose_gold: "Rose Gold",
  color_name_peach: "Peach",
  color_name_lavender: "Lavender",
  color_name_sage: "Sage Green",
  color_name_mint: "Mint",
  color_name_dusty_blue: "Dusty Blue",
  color_name_burgundy: "Burgundy",
  color_name_charcoal: "Charcoal",

  // ── Topping names ────────────────────────────────────────
  topping_name_strawberry: "Strawberries",
  topping_name_blueberry: "Blueberries",
  topping_name_raspberry: "Raspberries",
  topping_name_fig: "Fresh Figs",
  topping_name_edible_roses: "Edible Roses",
  topping_name_lavender: "Lavender Sprigs",
  topping_name_babys_breath: "Baby's Breath",
  topping_name_jasmine: "Jasmine Buds",
  topping_name_choc_drizzle: "Chocolate Drizzle",
  topping_name_choc_shards: "Chocolate Shards",
  topping_name_cocoa_dust: "Cocoa Dusting",
  topping_name_gold_leaf: "Gold Leaf",
  topping_name_rainbow_sprinkles: "Rainbow Sprinkles",
  topping_name_gold_sprinkles: "Gold Sprinkles",
  topping_name_pearl_sprinkles: "Pearl Balls",
  topping_name_pistachio: "Pistachio Crumble",
  topping_name_almond: "Almond Flakes",
  topping_name_walnut: "Walnut Pieces",

  // ── Font style names ─────────────────────────────────────
  font_name_serif: "Classic Serif",
  font_name_script: "Modern Script",
  font_name_bold: "Bold Block",
  font_name_handwritten: "Handwritten",

  // ── Placement labels ─────────────────────────────────────
  placement_center_top: "Center Top",
  placement_center_middle: "Center Middle",
  placement_center_bottom: "Center Bottom",
  placement_border_frame: "Border Frame",

  // ── Product names & descriptions ─────────────────────────
  product_name_birthday_brownie_box: "Birthday Brownie Box",
  product_desc_birthday_brownie_box:
    "Dense chocolate fudge brownies topped with rainbow sprinkles, a gold-dusted ganache finish, and a birthday candle — because every birthday deserves the good stuff.",
  product_name_congrats_brownie_tower: "Congrats Brownie Tower",
  product_desc_congrats_brownie_tower:
    "A stacked tower of gold-dusted dark chocolate brownies, gift-wrapped and ready to celebrate any big win in style.",
  product_name_graduation_brownie_platter: "Graduation Brownie Platter",
  product_desc_graduation_brownie_platter:
    "A generous platter of mixed fudge brownies and blondies, dressed in cap-and-gown ribbon — the perfect reward after years of hard work.",
  product_name_get_well_brownie_bundle: "Get Well Brownie Bundle",
  product_desc_get_well_brownie_bundle:
    "A cozy bundle of soft caramel blondies and classic fudge brownies — baked with warmth and sent with all the good wishes in the world.",
  product_name_bride_to_be_brownie_set: "Bride to Be Brownie Set",
  product_desc_bride_to_be_brownie_set:
    "Blush-frosted blondies adorned with edible pearls and rose-gold dust — bridal elegance captured in every single bite.",
  product_name_gender_reveal_brownie_box: "Gender Reveal Brownie Box",
  product_desc_gender_reveal_brownie_box:
    "Chocolate shell brownies with a surprise pink or blue fudge centre inside — crack one open and let the reveal begin.",
  product_name_customized_brownie_box: "Customized Brownie Box",
  product_desc_customized_brownie_box:
    "Fully bespoke brownie box — you choose the size, flavour, frosting colour, toppings, and personalised message. Made exactly how you imagined it.",
  product_name_walnut_brownie_box: "Walnut Brownie Box",
  product_desc_walnut_brownie_box:
    "Classic dark chocolate brownies packed with toasted walnut pieces — rich, chewy, and impossible to stop at one.",

  // ── About page ───────────────────────────────────────────
  about_hero_tag: "Our Story",
  about_hero_title_line1: "Crafted with Passion,",
  about_hero_title_line2: "Gifted with Love",
  about_hero_subtitle:
    "We believe every celebration deserves something extraordinary — brownies baked from the heart and delivered to yours.",
  about_hero_cta: "Explore Our Menu",
  about_story_tag: "The Beginning",
  about_story_title: "A Sweet Story Worth Telling",
  about_story_body1:
    "Biteez was born from a simple belief: that the best gifts come from the kitchen. Founded in Beirut, we set out to turn premium brownies into memorable experiences — for birthdays, graduations, weddings, and every moment that deserves to be celebrated in style.",
  about_story_body2:
    "Every box is handcrafted to order, using only the finest ingredients sourced from around the world. From Belgian chocolate to Iranian pistachio, we obsess over every detail so you don't have to.",
  about_values_tag: "What We Stand For",
  about_values_title: "Three Principles That Guide Every Bite",
  about_value1_title: "Handcrafted Excellence",
  about_value1_desc:
    "Every brownie is made by hand, in small batches, using time-honoured techniques that no machine can replicate.",
  about_value2_title: "Made with Love",
  about_value2_desc:
    "We pour genuine care into every order — because we know these brownies are going to someone who matters to you.",
  about_value3_title: "Premium Ingredients",
  about_value3_desc:
    "We refuse to compromise on quality. Every ingredient is carefully sourced for flavour, texture, and freshness.",
  about_stats_tag: "By the Numbers",
  about_stats_years_num: "3+",
  about_stats_years_label: "Years of Craft",
  about_stats_boxes_num: "10K+",
  about_stats_boxes_label: "Boxes Delivered",
  about_stats_customers_num: "2K+",
  about_stats_customers_label: "Happy Customers",
  about_stats_custom_num: "500+",
  about_stats_custom_label: "Custom Orders",

  // ── Contact page ─────────────────────────────────────────
  contact_hero_tag: "Get in Touch",
  contact_hero_title: "We'd Love to Hear From You",
  contact_hero_subtitle:
    "Have a question, a custom order request, or just want to say hello? We're here.",
  contact_info_title: "Contact Details",
  contact_address_label: "Address",
  contact_phone_label: "Phone",
  contact_email_label: "Email",
  contact_address_val: "123 Dessert Lane, Beirut, Lebanon",
  contact_phone_val: "+961 1 234 567",
  contact_email_val: "hello@biteez.com",
  contact_hours_title: "Opening Hours",
  contact_hours_val: "Daily · 9:00 AM – 9:00 PM",
  contact_social_title: "Follow Us",
  contact_location_title: "Find Us",
  contact_form_title: "Send a Message",
  contact_name_label: "Full Name",
  contact_name_placeholder: "Sarah Al-Khatib",
  contact_contact_email_label: "Email Address",
  contact_contact_email_placeholder: "sarah@email.com",
  contact_subject_label: "Subject",
  contact_subject_placeholder: "e.g. Custom order inquiry",
  contact_message_label: "Your Message",
  contact_message_placeholder: "Tell us what you need…",
  contact_submit_btn: "Send Message",
  contact_submitting: "Sending…",
  contact_success_title: "Message Sent!",
  contact_success_body:
    "Thank you for reaching out. We'll get back to you within 24 hours.",
  contact_error_name: "Please enter your name",
  contact_error_email: "Please enter a valid email address",
  contact_error_subject: "Please enter a subject",
  contact_error_message: "Please enter your message",
};

const ar: Record<string, string> = {
  // ── Navbar ───────────────────────────────────────────────
  nav_home: "الرئيسية",
  nav_menu: "القائمة",
  nav_about: "عنا",
  nav_contact: "تواصل",
  nav_lang_button: "English",
  nav_switch_label: "Switch to English",

  // ── Hero ─────────────────────────────────────────────────
  hero_title_line1: "بيتيز",
  hero_title_line2: "مخبزة الهدايا",
  hero_card1_title: "تشكيلات مختارة",
  hero_card1_subtitle: "براونيز هدايا مخصصة",
  hero_card2_title: "كلاسيكيات بيتيز",
  hero_card2_subtitle: "براونيز بأحجام مخصصة",
  hero_cta: "خصّص حلوياتك",
  hero_img_alt: "علبة هدايا براونيز بيتيز",

  // ── Footer ───────────────────────────────────────────────
  footer_tagline:
    "براونيز فاخرة مصنوعة يدوياً بحب وأجود المكونات. كل قضمة تحكي قصة شغف وإتقان.",
  footer_navigate: "روابط",
  footer_visit: "زورونا",
  footer_address: "شارع الحلوى ١٢٣، بيروت، لبنان",
  footer_copyright: "© ٢٠٢٤ بيتيز. جميع الحقوق محفوظة.",
  footer_crafted: "صُنع بكل حب ♥",
  footer_instagram: "إنستغرام",
  footer_facebook: "فيسبوك",
  footer_tiktok: "تيك توك",

  // ── Menu page ────────────────────────────────────────────
  menu_heading: "قائمتنا",
  menu_subtitle: "مصنوع يدوياً لكل مناسبة",
  menu_search_placeholder: "ابحث عن البراونيز والحلويات…",
  menu_no_results: "لا توجد نتائج",
  menu_no_results_hint: "جرّب بحثاً أو فئة مختلفة",
  menu_customise: "خصّص",
  menu_add_to_cart: "أضف للسلة",

  // ── Category labels ──────────────────────────────────────
  cat_all: "الكل",
  cat_customized: "مخصص",
  cat_birthday: "عيد ميلاد",
  cat_congrats: "تهنئة",
  cat_graduation: "تخرج",
  cat_get_well_soon: "الشفاء العاجل",
  cat_bride_to_be: "العروس",
  cat_gender_reveal: "الكشف عن الجنس",

  // ── Cart page ────────────────────────────────────────────
  cart_empty_title: "سلتك فارغة",
  cart_empty_desc:
    "يبدو أنك لم تضف أي شيء بعد. استكشف قائمتنا وابنِ طلبك المثالي.",
  cart_browse_menu: "تصفح القائمة",
  cart_title: "سلتي",
  cart_your_items: "منتجاتك",
  cart_clear_all: "مسح الكل",
  cart_continue_shopping: "متابعة التسوق",
  cart_order_summary: "ملخص الطلب",
  cart_subtotal: "المجموع الجزئي",
  cart_delivery: "التوصيل",
  cart_pickup_only: "استلام فقط",
  cart_total: "الإجمالي",
  cart_freshness_note:
    "جميع البراونيز تُخبز طازجة وتكون جاهزة للاستلام من بوتيكنا خلال ٢٤-٤٨ ساعة.",
  cart_checkout_btn: "المتابعة للدفع",
  cart_customization_shape: "الشكل",
  cart_customization_flavor: "النكهة",
  cart_customization_color: "اللون",

  // ── Checkout page ────────────────────────────────────────
  checkout_title: "إتمام الطلب",
  checkout_subtitle: "راجع طلبك وأكّده",
  checkout_empty: "سلتك فارغة",
  checkout_browse_menu: "تصفح القائمة ←",
  checkout_contact_section: "معلومات التواصل",
  checkout_full_name: "الاسم الكامل",
  checkout_phone: "رقم الهاتف",
  checkout_email: "البريد الإلكتروني",
  checkout_pickup_section: "تفاصيل الاستلام",
  checkout_boutique_name: "بوتيك بيتيز",
  checkout_address: "شارع الحلوى ١٢٣، بيروت، لبنان",
  checkout_hours: "مفتوح يومياً · ٩:٠٠ ص – ٩:٠٠ م",
  checkout_pickup_date: "تاريخ الاستلام",
  checkout_pickup_time: "وقت الاستلام",
  checkout_payment_section: "طريقة الدفع",
  checkout_payment_note:
    "يتم تحصيل الدفع عند الاستلام - لا يلزم الدفع الإلكتروني.",
  checkout_cash_pickup: "نقداً عند الاستلام",
  checkout_card_pickup: "بطاقة عند الاستلام",
  checkout_notes_section: "ملاحظات الطلب",
  checkout_special_requests: "طلبات خاصة (اختياري)",
  checkout_notes_placeholder: "حساسية، تغليف خاص، طلبات تزيين…",
  checkout_order_summary: "ملخص الطلب",
  checkout_subtotal: "المجموع الجزئي",
  checkout_delivery_free: "استلام · مجاني",
  checkout_total: "الإجمالي",
  checkout_placing: "جاري تقديم الطلب…",
  checkout_place_order: "تقديم الطلب",
  checkout_terms: "بتقديم طلبك، توافق على شروطنا وأحكامنا",
  checkout_error_name: "الاسم الكامل مطلوب",
  checkout_error_phone: "رقم الهاتف مطلوب",
  checkout_error_email: "بريد إلكتروني صالح مطلوب",
  checkout_error_pickup_date: "الرجاء اختيار تاريخ الاستلام",
  checkout_error_pickup_time: "الرجاء اختيار وقت الاستلام",
  checkout_name_placeholder: "سارة الخطيب",
  checkout_phone_placeholder: "+٩٦١ ٧٠ ٠٠٠ ٠٠٠",
  checkout_email_placeholder: "sarah@email.com",

  // ── Time slots ───────────────────────────────────────────
  timeslot_0: "١٠:٠٠ ص – ١٢:٠٠ م",
  timeslot_1: "١٢:٠٠ م – ٢:٠٠ م",
  timeslot_2: "٢:٠٠ م – ٥:٠٠ م",
  timeslot_3: "٥:٠٠ م – ٨:٠٠ م",

  // ── Checkout success ─────────────────────────────────────
  success_order_confirmed: "تم تأكيد الطلب",
  success_heading_prefix: "شكراً لك،",
  success_message:
    "تم استلام طلبك وبدأ فريقنا في التحضير. سيكون جاهزاً طازجاً للاستلام.",
  success_order_number: "رقم الطلب",
  success_pickup_location: "موقع الاستلام",
  success_boutique_name: "بوتيك بيتيز",
  success_address: "شارع الحلوى ١٢٣، بيروت، لبنان",
  success_pickup_time: "وقت الاستلام",
  success_email_note:
    "سيُرسل تأكيد إلى بريدك الإلكتروني. لأي تغييرات اتصل بنا على",
  success_back_home: "العودة للرئيسية",
  success_order_again: "اطلب مجدداً",

  // ── Product page ─────────────────────────────────────────
  product_not_found: "المنتج غير موجود",
  product_back_to_menu: "العودة للقائمة ←",
  product_price_per_box: "السعر للعلبة",
  product_quantity: "الكمية",
  product_total: "الإجمالي",
  product_add_to_cart: "أضف للسلة",
  product_adding: "جاري الإضافة…",
  product_freshness_note:
    "🍫 مخبوز طازج - جاهز للاستلام خلال ٢٤-٤٨ ساعة",

  // ── Customize page – step labels ─────────────────────────
  customize_step_shape: "الشكل",
  customize_step_flavor: "النكهة",
  customize_step_color: "اللون",
  customize_step_toppings: "الإضافات",
  customize_step_write: "كتابة وطباعة",
  customize_total_label: "الإجمالي",
  customize_next: "التالي ←",
  customize_confirm: "تأكيد الطلب",
  customize_preview_alt: "معاينة البراوني",

  // ── Customize – shape step ───────────────────────────────
  customize_shape_title: "اختر الحجم والشكل",
  customize_shape_subtitle: "اختر حجم العلبة المثالي لمناسبتك",

  // ── Customize – flavor step ──────────────────────────────
  customize_flavor_title: "اختر النكهة",
  customize_flavor_subtitle: "اختر الطعم الذي يجعل كل قضمة لا تُنسى",
  customize_flavor_included: "مشمول",

  // ── Customize – color step ───────────────────────────────
  customize_color_title: "اختر اللون",
  customize_color_subtitle: "اختر لون الغلاف لبراونيزك",

  // ── Customize – toppings step ────────────────────────────
  customize_toppings_title: "اختر الإضافات",
  customize_toppings_subtitle: "اختر ما تشاء - كل إضافة تُضاف لمجموعك",
  customize_toppings_search_placeholder: "ابحث عن الإضافات…",
  customize_toppings_no_results: "لا توجد إضافات تطابق بحثك",

  // ── Topping categories ───────────────────────────────────
  topping_cat_all: "الكل",
  topping_cat_fruits: "فواكه",
  topping_cat_flowers: "أزهار",
  topping_cat_chocolate: "شوكولاتة",
  topping_cat_sprinkles: "رشات",
  topping_cat_nuts: "مكسرات",

  // ── Customize – write step ───────────────────────────────
  customize_write_title: "كتابة وطباعة",
  customize_write_subtitle: "أضف رسالة مخصصة · +١٠ ريال",
  customize_message_label: "رسالتك",
  customize_message_placeholder: "مثل: عيد ميلاد سعيد يا سارة! 🎂",
  customize_font_style_label: "نمط الخط",
  customize_placement_label: "موضع الرسالة",

  // ── Shape names & servings ───────────────────────────────
  shape_name_mini: "علبة مصغرة",
  shape_name_small_standard: "علبة صغيرة",
  shape_name_small_heart: "علبة قلب",
  shape_name_standard: "علبة عادية",
  shape_name_large_box: "علبة كبيرة",
  shape_name_party_tray: "صينية حفلات",
  shape_serving_mini: "مناسب لـ 2-4 أشخاص",
  shape_serving_small_standard: "مناسب لـ 5-8 أشخاص",
  shape_serving_small_heart: "مناسب لـ 5-8 أشخاص",
  shape_serving_standard: "مناسب لـ 12-16 شخصاً",
  shape_serving_large_box: "مناسب لـ 20-25 شخصاً",
  shape_serving_party_tray: "مناسب لـ 30+ شخصاً",

  // ── Flavor names & descriptions ──────────────────────────
  flavor_name_vanilla: "بلوندي الفانيلا",
  flavor_name_red_velvet: "ريد فيلفت",
  flavor_name_chocolate: "فدج الشوكولاتة",
  flavor_name_pistachio: "الفستق والورد",
  flavor_name_lemon: "بلوندي الليمون",
  flavor_name_caramel: "كراميل مملح",
  flavor_name_strawberry: "دوامة الفراولة",
  flavor_name_matcha: "بلوندي الماتشا",
  flavor_desc_vanilla: "قاعدة بلوندي مطاطة مع حبة فانيلا من مدغشقر",
  flavor_desc_red_velvet: "براوني كاكاو مخملي مع كريمة الجبن",
  flavor_desc_chocolate: "براوني شوكولاتة مزدوجة مع رقائق بلجيكية داكنة",
  flavor_desc_pistachio: "بلوندي مع كريمة الفستق الإيراني وماء الورد",
  flavor_desc_lemon: "بلوندي حامض مع كرد الليمون الصقلي",
  flavor_desc_caramel: "براوني كراميل لزج مع ملح البحر",
  flavor_desc_strawberry: "براوني شوكولاتة بيضاء مع مربى فراولة طازجة",
  flavor_desc_matcha: "قاعدة بلوندي ترابية مع دوامة الماتشا الاحتفالية",

  // ── Color names ──────────────────────────────────────────
  color_name_white: "أبيض",
  color_name_ivory: "عاجي",
  color_name_cream: "كريمي",
  color_name_blush: "زهري خافت",
  color_name_rose_gold: "ذهبي وردي",
  color_name_peach: "خوخي",
  color_name_lavender: "لافندر",
  color_name_sage: "أخضر مريمية",
  color_name_mint: "نعناعي",
  color_name_dusty_blue: "أزرق مدخن",
  color_name_burgundy: "بورجوندي",
  color_name_charcoal: "فحمي",

  // ── Topping names ────────────────────────────────────────
  topping_name_strawberry: "فراولة",
  topping_name_blueberry: "توت أزرق",
  topping_name_raspberry: "توت العليق",
  topping_name_fig: "تين طازج",
  topping_name_edible_roses: "ورد صالح للأكل",
  topping_name_lavender: "أغصان اللافندر",
  topping_name_babys_breath: "زهرة العروس",
  topping_name_jasmine: "براعم الياسمين",
  topping_name_choc_drizzle: "رذاذ الشوكولاتة",
  topping_name_choc_shards: "شظايا الشوكولاتة",
  topping_name_cocoa_dust: "مسحوق الكاكاو",
  topping_name_gold_leaf: "ورق الذهب",
  topping_name_rainbow_sprinkles: "رشات قوس قزح",
  topping_name_gold_sprinkles: "رشات ذهبية",
  topping_name_pearl_sprinkles: "كرات اللؤلؤ",
  topping_name_pistachio: "فتات الفستق",
  topping_name_almond: "رقائق اللوز",
  topping_name_walnut: "قطع الجوز",

  // ── Font style names ─────────────────────────────────────
  font_name_serif: "خط كلاسيكي",
  font_name_script: "خط حديث",
  font_name_bold: "خط عريض",
  font_name_handwritten: "خط يدوي",

  // ── Placement labels ─────────────────────────────────────
  placement_center_top: "أعلى الوسط",
  placement_center_middle: "وسط",
  placement_center_bottom: "أسفل الوسط",
  placement_border_frame: "إطار حدودي",

  // ── Product names & descriptions ─────────────────────────
  product_name_birthday_brownie_box: "علبة براونيز عيد الميلاد",
  product_desc_birthday_brownie_box:
    "براونيز فدج الشوكولاتة الكثيفة مزينة برشات قوس قزح وغطاء جاناش مطلي بالذهب وشمعة عيد ميلاد — لأن كل عيد ميلاد يستحق الأفضل.",
  product_name_congrats_brownie_tower: "برج براونيز التهنئة",
  product_desc_congrats_brownie_tower:
    "برج متراكم من براونيز الشوكولاتة الداكنة المطلية بالذهب، مغلفة بشكل جميل وجاهزة للاحتفال بأي إنجاز بأسلوب راقٍ.",
  product_name_graduation_brownie_platter: "طبق براونيز التخرج",
  product_desc_graduation_brownie_platter:
    "طبق سخي من براونيز الفدج المشكلة والبلوندي، مزين بشريط القبعة والرداء — المكافأة المثالية بعد سنوات من العمل الجاد.",
  product_name_get_well_brownie_bundle: "حزمة براونيز للشفاء",
  product_desc_get_well_brownie_bundle:
    "حزمة دافئة من بلوندي الكراميل الناعم وبراونيز الفدج الكلاسيكية — مخبوزة بدفء ومرسلة مع أجمل الأمنيات.",
  product_name_bride_to_be_brownie_set: "طقم براونيز العروس",
  product_desc_bride_to_be_brownie_set:
    "بلوندي مزين بغلاف وردي ولآلئ صالحة للأكل وبودرة ذهبية وردية — أناقة عروسية في كل قضمة.",
  product_name_gender_reveal_brownie_box: "علبة براونيز الكشف عن الجنس",
  product_desc_gender_reveal_brownie_box:
    "براونيز بقشرة شوكولاتة مع مركز فدج وردي أو أزرق مفاجئ بداخلها — اكسر واحدة ودع الكشف يبدأ.",
  product_name_customized_brownie_box: "علبة براونيز مخصصة",
  product_desc_customized_brownie_box:
    "علبة براونيز مخصصة بالكامل — أنت تختار الحجم والنكهة ولون الغلاف والإضافات والرسالة المخصصة. مصنوع تماماً كما تخيلته.",
  product_name_walnut_brownie_box: "علبة براونيز الجوز",
  product_desc_walnut_brownie_box:
    "براونيز الشوكولاتة الداكنة الكلاسيكية محشوة بقطع الجوز المحمص — غنية ومطاطة ويستحيل التوقف عند واحدة.",

  // ── About page ───────────────────────────────────────────
  about_hero_tag: "قصتنا",
  about_hero_title_line1: "مصنوع بشغف،",
  about_hero_title_line2: "مُهدى بحب",
  about_hero_subtitle:
    "نؤمن بأن كل احتفال يستحق شيئاً استثنائياً — براونيز مخبوزة من القلب، تصل إلى قلبك.",
  about_hero_cta: "استكشف قائمتنا",
  about_story_tag: "البداية",
  about_story_title: "قصة حلوة تستحق أن تُروى",
  about_story_body1:
    "وُلدت بيتيز من قناعة بسيطة: أن أجمل الهدايا تأتي من المطبخ. انطلقنا من بيروت لنحوّل البراونيز الفاخرة إلى تجارب لا تُنسى — لأعياد الميلاد والتخرج والأفراح وكل لحظة تستحق الاحتفال.",
  about_story_body2:
    "كل علبة تُصنع يدوياً حسب الطلب، باستخدام أجود المكونات من حول العالم. من الشوكولاتة البلجيكية إلى الفستق الإيراني، نهتم بكل تفصيل حتى لا تحتاج أن تقلق.",
  about_values_tag: "ما نؤمن به",
  about_values_title: "ثلاثة مبادئ تقود كل قضمة",
  about_value1_title: "التميّز اليدوي",
  about_value1_desc:
    "كل براوني يُصنع باليد، في دفعات صغيرة، بتقنيات راسخة لا تستطيع الآلات تقليدها.",
  about_value2_title: "مصنوع بحب",
  about_value2_desc:
    "نضع اهتماماً حقيقياً في كل طلب — لأننا نعلم أن هذه البراونيز ستصل إلى شخص يهمّك.",
  about_value3_title: "مكوّنات فاخرة",
  about_value3_desc:
    "لا تنازل في الجودة. كل مكوّن مختار بعناية لنكهته وقوامه وطازجيّته.",
  about_stats_tag: "بالأرقام",
  about_stats_years_num: "+3",
  about_stats_years_label: "سنوات من الإتقان",
  about_stats_boxes_num: "+10 آلاف",
  about_stats_boxes_label: "علبة تم توصيلها",
  about_stats_customers_num: "+2 آلاف",
  about_stats_customers_label: "عميل سعيد",
  about_stats_custom_num: "+500",
  about_stats_custom_label: "طلب مخصص",

  // ── Contact page ─────────────────────────────────────────
  contact_hero_tag: "تواصل معنا",
  contact_hero_title: "يسعدنا سماعك",
  contact_hero_subtitle:
    "لديك سؤال، طلب مخصص، أو تريد فقط أن تقول مرحباً؟ نحن هنا.",
  contact_info_title: "بيانات التواصل",
  contact_address_label: "العنوان",
  contact_phone_label: "الهاتف",
  contact_email_label: "البريد الإلكتروني",
  contact_address_val: "شارع الحلوى ١٢٣، بيروت، لبنان",
  contact_phone_val: "+٩٦١ ١ ٢٣٤ ٥٦٧",
  contact_email_val: "hello@biteez.com",
  contact_hours_title: "أوقات العمل",
  contact_hours_val: "يومياً · ٩:٠٠ ص – ٩:٠٠ م",
  contact_social_title: "تابعونا",
  contact_location_title: "موقعنا",
  contact_form_title: "أرسل رسالة",
  contact_name_label: "الاسم الكامل",
  contact_name_placeholder: "سارة الخطيب",
  contact_contact_email_label: "البريد الإلكتروني",
  contact_contact_email_placeholder: "sarah@email.com",
  contact_subject_label: "الموضوع",
  contact_subject_placeholder: "مثل: استفسار عن طلب مخصص",
  contact_message_label: "رسالتك",
  contact_message_placeholder: "أخبرنا بما تحتاجه…",
  contact_submit_btn: "إرسال الرسالة",
  contact_submitting: "جاري الإرسال…",
  contact_success_title: "تم الإرسال!",
  contact_success_body:
    "شكراً لتواصلك. سنردّ عليك خلال ٢٤ ساعة.",
  contact_error_name: "يرجى إدخال اسمك",
  contact_error_email: "يرجى إدخال بريد إلكتروني صالح",
  contact_error_subject: "يرجى إدخال الموضوع",
  contact_error_message: "يرجى إدخال رسالتك",
};

export const translations: Record<Lang, Record<string, string>> = { en, ar };

export function createTranslator(lang: Lang) {
  return function t(key: string): string {
    return translations[lang][key] ?? translations.en[key] ?? key;
  };
}
