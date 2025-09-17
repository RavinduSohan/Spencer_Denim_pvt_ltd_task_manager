async function testDynamicTablesValidation() {
  console.log('🧪 Testing Dynamic Tables Validation and Data Types...\n');

  try {
    // Test creating an employee record with various data types
    const newEmployee = {
      firstName: 'Jane',
      lastName: 'Smith',
      email: 'jane.smith@test.com',
      department: 'Engineering',
      position: 'Developer',
      salary: 85000,              // number
      hireDate: '2024-01-15',     // date string
      isActive: true,             // boolean
      notes: 'Test employee with boolean and number fields'
    };

    console.log('Sending request to create employee...');
    console.log('Data:', JSON.stringify(newEmployee, null, 2));

    const response = await fetch('http://localhost:3000/api/tables/employees', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(newEmployee)
    });

    const result = await response.json();
    
    if (response.ok) {
      console.log('✅ Employee created successfully!');
      console.log('Response:', JSON.stringify(result, null, 2));
      
      // Test retrieving the record to verify data type conversion
      console.log('\n📋 Retrieving records to verify data types...');
      const getResponse = await fetch('http://localhost:3000/api/tables/employees?limit=5');
      const getResult = await getResponse.json();
      
      if (getResponse.ok && getResult.data?.records) {
        console.log('✅ Records retrieved successfully!');
        console.log('Sample record:', JSON.stringify(getResult.data.records[0], null, 2));
      }
    } else {
      console.log('❌ Failed to create employee');
      console.log('Status:', response.status);
      console.log('Error:', JSON.stringify(result, null, 2));
    }

  } catch (error) {
    console.error('❌ Test failed:', error.message);
  }
}

testDynamicTablesValidation();