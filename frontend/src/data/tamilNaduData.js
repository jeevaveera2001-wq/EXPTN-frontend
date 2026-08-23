export const TAMIL_NADU_CATEGORIES = [
  { id: 'top15', name: 'Top 15 Must-Visit', icon: '⭐' },
  { id: 'hills', name: 'Hill Stations', icon: '🏞️' },
  { id: 'beaches', name: 'Beaches & Coastal', icon: '🏖️' },
  { id: 'waterfalls', name: 'Waterfalls', icon: '🌊' },
  { id: 'temples', name: 'Famous Temples', icon: '🛕' },
  { id: 'wildlife', name: 'Wildlife & Nature', icon: '🌿' },
  { id: 'heritage', name: 'Heritage & Culture', icon: '🏛️' },
  { id: 'adventure', name: 'Adventure & Activities', icon: '🚤' },
  { id: 'churches', name: 'Christian Churches & Basilicas', icon: '⛪' },
  { id: 'mosques', name: 'Famous Mosques & Dargahs', icon: '🕌' }
];

export const TOURISM_PLACES = [
  // ⭐ Top 15 Must-Visit
  { id: 'p-1', name: 'Ooty (Nilgiris)', category: 'top15', subCategory: 'Hill Stations', image: '/assets/hills/ooty_nilgiris.jpg', region: 'Nilgiris District', desc: 'Queen of Hill Stations featuring Nilgiri Toy Train, tea estate sunset slopes, and Botanical Gardens.' },
  { id: 'p-2', name: 'Kodaikanal (Princess of Hills)', category: 'top15', subCategory: 'Hill Stations', image: '/assets/hills/kodaikanal_hill_station.jpg', region: 'Dindigul District', desc: 'Princess of Hill Stations with star-shaped Kodai Lake, pine forests, Coaker’s Walk, and Pillar Rocks.' },
  { id: 'p-3', name: 'Kanyakumari', category: 'top15', subCategory: 'Coastal & Memorial', image: '/assets/beaches/kanyakumari_rock_memorial.jpg', region: 'Kanyakumari District', desc: 'Triveni Sangam ocean sunset convergence with Vivekananda Rock Memorial and 133ft Thiruvalluvar Statue.' },
  { id: 'p-4', name: 'Rameswaram (Pamban Island)', category: 'top15', subCategory: 'Coastal & Sea Bridge', image: '/assets/beaches/pamban_bridge_rameswaram.jpg', region: 'Ramanathapuram (Pamban Island)', desc: 'Sacred island featuring the historic Pamban Railway Sea Bridge over turquoise waters and Ramanathaswamy Temple.' },
  { id: 'p-5', name: 'Madurai (Meenakshi Amman City)', category: 'top15', subCategory: 'Temple & Culture', image: '/assets/temples/meenakshi_temple_blessings.jpg', region: 'Madurai, South Tamil Nadu', desc: 'Historic temple city centered around the grand Meenakshi Sundareswarar Temple and 14 gopuram towers.' },
  { id: 'p-6', name: 'Mahabalipuram (Mamallapuram)', category: 'top15', subCategory: 'UNESCO Heritage Shore Temple', image: '/assets/heritage/mahabalipuram_shore_temple.jpg', region: 'Chengalpattu District (ECR)', desc: '7th-century UNESCO Shore Temple built by Pallava Dynasty at golden sunset over Bay of Bengal waves.' },
  { id: 'p-7', name: 'Yercaud (Jewel of Shevaroy Hills)', category: 'top15', subCategory: 'Hill Station & Ghat Road', image: '/assets/hills/yercaud_hill_station.jpg', region: 'Salem District', desc: 'Jewel of Shevaroy Hills featuring 20 winding hairpin ghat bends, coffee plantations, orange groves, and Emerald Lake.' },
  { id: 'p-8', name: 'Hogenakkal Falls', category: 'top15', subCategory: 'Waterfalls & River', image: '/assets/activities/hogenakkal_coracle_rides.jpg', region: 'Dharmapuri District', desc: 'Niagara of India featuring thrilling bamboo coracle river rides below surging cascades.' },
  { id: 'p-9', name: 'Courtallam', category: 'top15', subCategory: 'Waterfalls', image: 'https://images.unsplash.com/photo-1432405972618-c60b0225b8f9?auto=format&fit=crop&w=800&q=80', region: 'Tenkasi District', desc: 'Spa of South India with therapeutic herbal waterfall baths.' },
  { id: 'p-10', name: 'Thanjavur (Tanjore)', category: 'top15', subCategory: 'Heritage & Chola Temple', image: '/assets/temples/brihadisvara_temple.jpg', region: 'Cauvery River Delta', desc: 'Capital of Chola Empire home to Great Brihadisvara Temple (Tanjore Big Temple).' },

  // 🏞️ Hill Stations (User-Uploaded Images)
  { id: 'p-11', name: 'Yercaud', category: 'hills', subCategory: 'Shevaroy Hills & Ghat Road', image: '/assets/hills/yercaud_hill_station.jpg', region: 'Salem District', desc: 'Jewel of Shevaroy Hills with 20 hairpin bend mountain passes under dramatic rain clouds and coffee plantations.' },
  { id: 'p-12', name: 'Ooty (Nilgiris)', category: 'hills', subCategory: 'Tea Estates & Botanical Gardens', image: '/assets/hills/ooty_nilgiris.jpg', region: 'Nilgiris District', desc: 'Queen of Hill Stations boasting golden tea estate sunsets, Doddabetta Peak, and steam toy train rides.' },
  { id: 'p-13', name: 'Kodaikanal', category: 'hills', subCategory: 'Kodai Lake & Pine Forests', image: '/assets/hills/kodaikanal_hill_station.jpg', region: 'Dindigul District', desc: 'Princess of Hill Stations featuring star-shaped Kodai Lake surrounded by dense pine forests and mountain ridges.' },
  { id: 'p-14', name: 'Valparai', category: 'hills', subCategory: 'Hairpin Bends & Tiger Reserve', image: '/assets/hills/valparai_hill_station.jpg', region: 'Coimbatore District', desc: 'High altitude tea and coffee hill plateau famous for 40 thrilling hairpin bends, monkey falls, and Anamalai tiger sanctuary.' },
  { id: 'p-15', name: 'Yelagiri', category: 'hills', subCategory: 'Punganoor Lake & Paragliding', image: '/assets/hills/yelagiri_hill_station.jpg', region: 'Tirupathur District', desc: 'Peaceful hill station cluster offering Punganoor Lake boating, green valleys, orchards, and Swamimalai trekking.' },
  { id: 'p-16', name: 'Coonoor', category: 'hills', subCategory: 'Tea Estates & Sim’s Park', image: '/assets/hills/coonoor_hill_station.jpg', region: 'Nilgiris District', desc: 'Serene tea garden hill station famous for Sim’s Park, Catherine Falls, Dolphin’s Nose, and rolling green tea estates.' },

  // 🏖️ Beaches & Coastal (User-Uploaded Images)
  { id: 'p-17', name: 'Rameswaram & Pamban Sea Bridge', category: 'beaches', subCategory: 'Pamban Bridge & Island', image: '/assets/beaches/pamban_bridge_rameswaram.jpg', region: 'Ramanathapuram (Pamban Island)', desc: 'Engineering marvel Pamban Railway Sea Bridge stretching across vibrant turquoise ocean waters.' },
  { id: 'p-18', name: 'Kanyakumari', category: 'beaches', subCategory: 'Triveni Sangam & Rock Memorial', image: '/assets/beaches/kanyakumari_rock_memorial.jpg', region: 'Kanyakumari District', desc: 'Triveni Sangam ocean sunset convergence of Indian Ocean, Arabian Sea, & Bay of Bengal with Vivekananda Rock Memorial.' },
  { id: 'p-19', name: 'Dhanushkodi', category: 'beaches', subCategory: 'Land’s End & Ocean Convergence', image: '/assets/beaches/dhanushkodi_beach.jpg', region: 'Ramanathapuram (Pamban Island)', desc: 'Iconic land’s end road at the tip of Pamban island where the Indian Ocean and Bay of Bengal converge.' },
  { id: 'p-20', name: 'Marina Beach', category: 'beaches', subCategory: 'Urban Beach & Promenade', image: '/assets/beaches/marina_beach.jpg', region: 'Chennai', desc: 'World’s second longest natural urban beach along the Bay of Bengal with iconic Kamarajar Salai promenade.' },
  { id: 'p-21', name: 'Covelong Beach (Kovalam)', category: 'beaches', subCategory: 'Beaches & Sunset', image: '/assets/beaches/covelong_beach.jpg', region: 'Chengalpattu (ECR)', desc: 'Serene sunset beach village with historic Dutch fort ruins along the golden sandy Bay of Bengal shore.' },
  { id: 'p-22', name: 'Poompuhar (Kaveripoompattinam)', category: 'beaches', subCategory: 'Heritage Coast & Ancient Port', image: '/assets/beaches/poompuhar_beach.jpg', region: 'Mayiladuthurai District', desc: 'Ancient Sangam Chola port town along the Cauvery River mouth featuring Masilamani Nathar Temple along the rocky shore.' },

  // 🌊 Waterfalls (User-Uploaded Images)
  { id: 'p-23', name: 'Suruli Falls', category: 'waterfalls', subCategory: '2-Stage Cascade', image: '/assets/waterfalls/suruli_falls.jpg', region: 'Theni District', desc: '2-stage cascade waterfall originating from Megamalai mountain streams with natural bathing pools.' },
  { id: 'p-24', name: 'Agaya Gangai Waterfalls', category: 'waterfalls', subCategory: 'Gorge Waterfalls', image: '/assets/waterfalls/agaya_gangai_falls.jpg', region: 'Kolli Hills, Namakkal', desc: '300ft spectacular vertical drop waterfall cascading down cliff rocks in Aiyaru river gorge inside Eastern Ghats forest.' },
  { id: 'p-25', name: 'Catherine Falls', category: 'waterfalls', subCategory: 'Nilgiris Waterfalls', image: '/assets/waterfalls/catherine_falls.jpg', region: 'Kotagiri, Nilgiris', desc: 'Spectacular 250ft double-tier cascading waterfall flowing over dark forest rocks amidst Nilgiri tea plantations.' },

  // 🛕 Famous Temples (User-Uploaded Images)
  { id: 'p-26', name: 'Meenakshi Amman Temple', category: 'temples', subCategory: 'Ancient Dravidian Temple', image: '/assets/temples/meenakshi_temple_blessings.jpg', region: 'Madurai', desc: 'Blessings from Meenakshi Temple: Dravidian architectural masterpiece with 14 colorful gopuram towers and Golden Lotus Tank.' },
  { id: 'p-27', name: 'Ramanathaswamy Temple', category: 'temples', subCategory: 'Jyotirlinga & Longest Corridor', image: '/assets/temples/ramanathaswamy_temple.jpg', region: 'Rameswaram Island', desc: 'Sacred Jyotirlinga temple famous for the world’s longest 1212-pillar corridor with vibrant hand-painted ceiling artwork.' },
  { id: 'p-28', name: 'Brihadisvara Temple (Tanjore Big Temple)', category: 'temples', subCategory: 'UNESCO Great Chola Temple', image: '/assets/temples/brihadisvara_temple.jpg', region: 'Thanjavur (Tanjore)', desc: '1010 AD UNESCO Great Living Chola Temple built by Emperor Raja Raja Chola I with 216ft single granite Vimana tower.' },
  { id: 'p-29', name: 'Arunachaleswarar Temple', category: 'temples', subCategory: 'Shiva Temple & Fire Stalam', image: '/assets/temples/arunachaleswarar_temple.jpg', region: 'Tiruvannamalai', desc: 'Pancha Bhoota Stalam representing the element of Fire (Agni Stalam) at the foot of holy Annamalai hill with towering white Rajagopuram.' },
  { id: 'p-30', name: 'Palani Murugan Temple', category: 'temples', subCategory: 'Hilltop Temples', image: '/assets/temples/palani_murugan_temple.jpg', region: 'Palani, Dindigul', desc: 'One of the six sacred abodes (Arupadaiveedu) of Lord Murugan atop Sivagiri hill, featuring golden gopuram and peacocks.' },

  // 🌿 Wildlife & Nature (User-Uploaded Images)
  { id: 'p-31', name: 'Anamalai Tiger Reserve', category: 'wildlife', subCategory: 'Wildlife & Tiger Reserve', image: '/assets/wildlife/anamalai_tiger_reserve.jpg', region: 'Pollachi, Anamalai Hills', desc: 'Protected Western Ghats rainforest sanctuary harboring Bengal tigers, wild elephant herds, Nilgiri Tahr, and mountain waterfalls.' },
  { id: 'p-32', name: 'Pichavaram Mangrove Forest', category: 'wildlife', subCategory: 'Nature & Mangroves', image: '/assets/wildlife/pichavaram_mangrove.jpg', region: 'Chidambaram, Cuddalore', desc: 'World’s second largest mangrove forest featuring wooden boat rides through 4,400 intricate stilt-root water channels.' },
  { id: 'p-33', name: 'Mudumalai National Park', category: 'wildlife', subCategory: 'National Park & Wildlife', image: '/assets/wildlife/mudumalai_national_park.jpg', region: 'Nilgiris District (Est. 1940)', desc: 'UNESCO Nilgiri Biosphere reserve established in 1940, home to Asian elephant herds, spotted deer, Malabar pied hornbills, and bamboo river streams.' },

  // 🏛️ Heritage & Culture (User-Uploaded Images)
  { id: 'p-34', name: 'Mahabalipuram Shore Temple', category: 'heritage', subCategory: 'UNESCO Shore Temple & Monoliths', image: '/assets/heritage/mahabalipuram_shore_temple.jpg', region: 'Mamallapuram (Chengalpattu)', desc: 'UNESCO World Heritage Pallava Shore Temple built in 700 AD with granite sea carved monoliths & Pancha Rathas.' },
  { id: 'p-35', name: 'Chettinad Heritage Zone', category: 'heritage', subCategory: 'Heritage & Palaces', image: '/assets/heritage/chettinad_heritage.jpg', region: 'Kanadukathan, Sivaganga', desc: 'Palatial 19th-century Chettinad mansions, Kanadukathan Heritage Palace, Burmese teak pillars, & traditional architecture.' },
  { id: 'p-36', name: 'Kanchipuram', category: 'heritage', subCategory: 'Heritage', image: 'https://images.unsplash.com/photo-1582510003544-4d00b7f74220?auto=format&fit=crop&w=800&q=80', region: 'Kanchipuram District', desc: 'City of 1000 Temples and birthplace of handwoven Kanjeevaram silk sarees.' },

  // 🚤 Adventure & Activities (User-Uploaded Images)
  { id: 'p-37', name: 'Surfing at Covelong', category: 'adventure', subCategory: 'Adventure & Surfing', image: '/assets/activities/covelong_surfing.jpg', region: 'Covelong Beach, ECR', desc: 'Premier ocean surfing academy riding white ocean waves along Covelong Kovalam beach.' },
  { id: 'p-38', name: 'Coracle Rides at Hogenakkal', category: 'adventure', subCategory: 'Adventure & River', image: '/assets/activities/hogenakkal_coracle_rides.jpg', region: 'Hogenakkal, Dharmapuri', desc: 'Thrilling circular bamboo coracle boat rides navigating through roaring Kaveri river drops and rainbow spray.' },

  // ⛪ Famous Christian Churches & Basilicas (User-Uploaded Photos)
  { id: 'p-39', name: 'Basilica of Our Lady of Good Health', category: 'churches', subCategory: 'Churches & Basilicas', image: '/assets/churches/velankanni_basilica.jpg', region: 'Velankanni, Nagapattinam', desc: 'Lourdes of the East sacred white Marian Gothic shrine along the Bay of Bengal coast.' },
  { id: 'p-40', name: "St. John's Church", category: 'churches', subCategory: 'Churches & Basilicas', image: '/assets/churches/st_johns_church.jpg', region: 'Vellore Fort & Trichy', desc: 'Historic colonial church with classic bell tower, dome, and serene garden campus.' },
  { id: 'p-41', name: "St. Mary's Cathedral", category: 'churches', subCategory: 'Churches & Basilicas', image: '/assets/churches/st_marys_cathedral.jpg', region: 'Madurai, Tamil Nadu', desc: 'Historic cathedral combining classic Dravidian and European Christian sanctuary architecture.' },

  // 🕌 Famous Mosques & Dargahs (User-Uploaded Photos)
  { id: 'p-42', name: 'Big Mosque (Wallajah Big Mosque)', category: 'mosques', subCategory: 'Mosques & Dargahs', image: '/assets/mosques/wallajah_big_mosque.jpg', region: 'Triplicane, Chennai', desc: '1795 AD historic grand granite mosque with twin soaring minarets built by the Nawab of Arcot.' },
  { id: 'p-43', name: 'Thousand Lights Mosque', category: 'mosques', subCategory: 'Mosques & Dargahs', image: '/assets/mosques/thousand_lights_mosque.jpg', region: 'Chennai', desc: 'Historic multi-domed Shia mosque illuminated by 1000 oil lamps during the festival.' },
  { id: 'p-44', name: 'Nagore Dargah Shrine', category: 'mosques', subCategory: 'Mosques & Dargahs', image: '/assets/mosques/nagore_dargah.jpg', region: 'Nagapattinam', desc: '500-year-old famous Sufi shrine with 5 soaring minarets along the Bay of Bengal coast.' }
];
