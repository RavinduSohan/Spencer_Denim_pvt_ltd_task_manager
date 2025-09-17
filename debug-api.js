// Debug script to test database API calls
const testApiCall = async (databaseType) => {
  try {
    const response = await fetch('http://localhost:3000/api/tasks', {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'x-database-type': databaseType,
        'x-user-id': 'default-user-id'
      }
    });

    console.log(`\n=== Testing ${databaseType.toUpperCase()} Database ===`);
    console.log('Status:', response.status);
    console.log('Status Text:', response.statusText);
    
    if (!response.ok) {
      const errorText = await response.text();
      console.log('Error Response:', errorText);
    } else {
      const data = await response.json();
      console.log('Success:', data.success);
      console.log('Data length:', data.data?.data?.length || 0);
    }
  } catch (error) {
    console.error(`Error testing ${databaseType}:`, error.message);
  }
};

// Test both databases
(async () => {
  console.log('Testing API calls with different database types...');
  await testApiCall('postgres');
  await testApiCall('sqlite');
})();