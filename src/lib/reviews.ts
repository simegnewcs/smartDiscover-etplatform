export interface InitialReview {
  author: string
  rating: number
  comment: string
}

export function generateInitialReviews(businessName: string, category: string, rating: number = 4.7): InitialReview[] {
  const norm = (businessName || '').toLowerCase()

  // Tailored, high-fidelity reviews for major recognized properties
  if (norm.includes('haile grand') || norm.includes('haile resort')) {
    return [
      {
        author: 'Dawit Mengistu (Google Local Guide)',
        rating: 5,
        comment: `Outstanding stay at Haile Grand Addis Ababa! The hillside setting near Lamberet Square offers gorgeous panoramic views of Addis Ababa. The heated outdoor swimming pool and spa are among the finest in the city.`
      },
      {
        author: 'Selamawit Tadesse (Verified Traveler)',
        rating: 5,
        comment: `True 5-star Ethiopian hospitality. The rooms are expansive, quiet, and elegantly furnished with comfortable beds. The complimentary airport shuttle was prompt and stress-free.`
      },
      {
        author: 'Michael Berhanu (Business Guest)',
        rating: 4,
        comment: `Superb conference and business facilities. Reliable high-speed WiFi, modern fitness center, and a rich breakfast buffet with authentic traditional Ethiopian coffee ceremony.`
      },
      {
        author: 'Sara Haile (Local Reviewer)',
        rating: 5,
        comment: `The dining options and terrace bar here are exceptional. Attentive, courteous staff who go above and beyond to make your visit memorable. Highly recommended luxury hotel!`
      },
      {
        author: 'Ephrem Getachew (Google Verified Reviewer)',
        rating: 5,
        comment: `One of the most impressive luxury hotel additions to Addis Ababa. Cleanliness, security, and world-class hospitality inspired by Athlete Haile Gebrselassie's legendary excellence.`
      }
    ]
  }

  if (norm.includes('skylight')) {
    return [
      {
        author: 'Abebe Kebede (Verified Frequent Flyer)',
        rating: 5,
        comment: `Ethiopian Skylight Hotel is world-class. Located minutes from Bole Airport with seamless 24/7 shuttle, stunning indoor and outdoor pools, and massive conference facilities.`
      },
      {
        author: 'Sara Tesfaye (Google Local Guide)',
        rating: 5,
        comment: `The multiple international restaurants, Chinese cuisine, and traditional Ethiopian dining here are top-tier. Exceptionally comfortable and spacious executive suites.`
      },
      {
        author: 'Dawit Mengistu (Business Traveler)',
        rating: 5,
        comment: `The premier business hotel in East Africa. Impeccable cleanliness, attentive staff, and luxurious amenities throughout.`
      },
      {
        author: 'Selamawit Tadesse (Verified Guest)',
        rating: 5,
        comment: `Exceptional hospitality and modern luxury. Beautiful lobby atmosphere and top-notch security.`
      },
      {
        author: 'Ephrem Getachew (Google Reviewer)',
        rating: 5,
        comment: `5-star experience from arrival to departure. Best airport transit and luxury stay in Addis Ababa.`
      }
    ]
  }

  if (norm.includes('bonroyal') || norm.includes('th bonroyal')) {
    return [
      {
        author: 'Selamawit Tadesse (Google Local Guide)',
        rating: 5,
        comment: `Outstanding stay at TH Bonroyal Hotel! Conveniently located on Bole Ring Road just minutes from the airport. Rooms are sparkling clean, modern, and very comfortable.`
      },
      {
        author: 'Abebe Kebede (Verified Business Traveler)',
        rating: 5,
        comment: `Fast airport shuttle service, reliable high-speed internet, and very quiet rooms. Perfect for both short business trips and longer visits.`
      },
      {
        author: 'Dawit Mengistu (Verified Guest)',
        rating: 4,
        comment: `Delicious breakfast with great variety and authentic Ethiopian coffee. Friendly, helpful staff always eager to assist.`
      },
      {
        author: 'Sara Haile (Local Reviewer)',
        rating: 5,
        comment: `Very impressed with the secure parking, spa facilities, and professional front desk team. Great value for a 4-star hotel in Bole.`
      },
      {
        author: 'Ephrem Getachew (Google Verified Reviewer)',
        rating: 5,
        comment: `Great Ethiopian hospitality and comfortable accommodations. Highly recommend TH Bonroyal to travelers looking for comfort near Bole.`
      }
    ]
  }

  const roundRating = Math.min(5, Math.max(4, Math.round(rating || 5)))
  const subRating = roundRating === 5 ? 5 : 4

  if (category === 'Hotels') {
    return [
      {
        author: 'Selamawit Tadesse (Google Local Guide)',
        rating: roundRating,
        comment: `Outstanding stay at ${businessName}! The rooms are exceptionally clean, modern, and quiet. Front desk staff were warm, welcoming, and very attentive to every detail.`
      },
      {
        author: 'Abebe Kebede (Verified Business Traveler)',
        rating: 5,
        comment: `Convenient location with reliable high-speed WiFi, spacious work desk, and a very comfortable bed. Perfect for business visits.`
      },
      {
        author: 'Dawit Mengistu (Verified Guest)',
        rating: subRating,
        comment: `The breakfast buffet and traditional Ethiopian coffee ceremony here are extraordinary! Delicious variety of fresh dishes and wonderful dining ambiance.`
      },
      {
        author: 'Sara Haile (Local Reviewer)',
        rating: roundRating,
        comment: `Very impressed with the security, parking, and overall maintenance. Professional management and great value for the standard of service provided.`
      },
      {
        author: 'Ephrem Getachew (Google Verified Reviewer)',
        rating: 5,
        comment: `One of the best hotel experiences in the city. Truly authentic Ethiopian charm with great hospitality. Highly recommend ${businessName}.`
      }
    ]
  }

  if (category === 'Restaurants' || category === 'Cafés') {
    return [
      {
        author: 'Yonas Bekele (Food Guide)',
        rating: roundRating,
        comment: `Authentic flavors, fresh ingredients, and exceptional taste at ${businessName}. Cozy seating atmosphere and quick service.`
      },
      {
        author: 'Hanan Mohammed (Verified Customer)',
        rating: 5,
        comment: `One of my favorite spots in town! Great coffee, delicious menu options, and very polite customer-focused staff.`
      },
      {
        author: 'Kidus Tilahun (Local Guide)',
        rating: subRating,
        comment: `Consistently great quality and clean environment. Perfect place for meetings or catching up with friends.`
      },
      {
        author: 'Bethlehem Alemu (Verified Diner)',
        rating: roundRating,
        comment: `Generous portion sizes, warm Ethiopian hospitality, and fair pricing. Always a pleasure dining here.`
      },
      {
        author: 'Michael Berhanu (Google Reviewer)',
        rating: 5,
        comment: `Highly recommended! Excellent ambiance, fast takeaway, and seamless service every single time.`
      }
    ]
  }

  return [
    {
      author: 'Ephrem Getachew (Google Verified Reviewer)',
      rating: roundRating,
      comment: `Top-notch quality, professional staff, and trusted service at ${businessName}. A smooth and pleasant experience throughout.`
    },
    {
      author: 'Bethlehem Alemu (Local Reviewer)',
      rating: 5,
      comment: `Reliable, transparent, and highly recommended in this neighborhood. Very pleased with the overall responsiveness.`
    },
    {
      author: 'Dawit Haile (Verified Customer)',
      rating: subRating,
      comment: `Clean facilities, polite personnel, and prompt attention to customer needs. Will definitely use their services again.`
    },
    {
      author: 'Selamawit Tadesse (Local Guide)',
      rating: roundRating,
      comment: `Consistent quality and trusted standards. One of the top recommended providers in the area.`
    },
    {
      author: 'Abebe Kebede (Verified Reviewer)',
      rating: 5,
      comment: `Excellent overall experience with ${businessName}. Friendly staff and very efficient service.`
    }
  ]
}

