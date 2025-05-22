const db = require('../config/firebase'); // Import the Firebase configuration

async function addData() {
  try {
    const docRef = db.collection('tourPackages').doc(); // Create a new document in the 'tourPackages' collection
    
    const tourPackageData = {
      name: 'Exciting Italy Tour',
      description: 'Explore the beauty of Italy with our exclusive tour package.',
      price: 1500,
      available: true,
      startDate: new Date('2025-06-01'),
      endDate: new Date('2025-06-15'),
    };

    // Add data to the Firestore document
    await docRef.set(tourPackageData);

    console.log('Data added to Firestore');
  } catch (error) {
    console.error('Error adding document: ', error);
  }
}

addData();
