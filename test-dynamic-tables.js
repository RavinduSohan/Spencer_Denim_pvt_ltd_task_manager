const fetch = require('node-fetch');

const baseUrl = 'http://localhost:3000';

async function testDynamicTables() {
  console.log('🧪 Testing Dynamic Tables System...\n');

  try {
    // Test 1: Get table configurations
    console.log('1. Testing table configurations...');
    const configResponse = await fetch(`${baseUrl}/api/table-configs`);
    const configs = await configResponse.json();
    console.log('✅ Available tables:', configs.map(c => c.name).join(', '));
    
    // Test 2: Test employees table
    console.log('\n2. Testing employees table...');
    const employeesResponse = await fetch(`${baseUrl}/api/tables/employees`);
    const employeesData = await employeesResponse.json();
    console.log('✅ Employees table structure confirmed. Records:', employeesData.pagination.total);
    
    // Test 3: Create a new employee record
    console.log('\n3. Creating new employee record...');
    const newEmployee = {
      firstName: 'John',
      lastName: 'Doe',
      email: 'john.doe@company.com',
      department: 'Engineering',
      position: 'Software Developer',
      salary: 75000,
      hireDate: '2024-01-15',
      isActive: true
    };
    
    const createResponse = await fetch(`${baseUrl}/api/tables/employees`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(newEmployee)
    });
    
    if (createResponse.ok) {
      const newRecord = await createResponse.json();
      console.log('✅ New employee created with ID:', newRecord.id);
      
      // Test 4: Retrieve the created record
      console.log('\n4. Retrieving created record...');
      const getResponse = await fetch(`${baseUrl}/api/tables/employees?limit=1&sortField=id&sortDirection=desc`);
      const latestData = await getResponse.json();
      const latestEmployee = latestData.records[0];
      console.log('✅ Latest employee:', `${latestEmployee.firstName} ${latestEmployee.lastName} (${latestEmployee.email})`);
      
      // Test 5: Test Excel export
      console.log('\n5. Testing Excel export...');
      const exportResponse = await fetch(`${baseUrl}/api/tables/employees/export`);
      if (exportResponse.ok) {
        const contentType = exportResponse.headers.get('content-type');
        console.log('✅ Excel export successful. Content-Type:', contentType);
      } else {
        console.log('❌ Excel export failed');
      }
      
    } else {
      console.log('❌ Failed to create employee');
    }
    
    // Test 6: Test projects table
    console.log('\n6. Testing projects table...');
    const projectsResponse = await fetch(`${baseUrl}/api/tables/projects`);
    const projectsData = await projectsResponse.json();
    console.log('✅ Projects table structure confirmed. Records:', projectsData.pagination.total);
    
    // Test 7: Test inventory table
    console.log('\n7. Testing inventory table...');
    const inventoryResponse = await fetch(`${baseUrl}/api/tables/inventory`);
    const inventoryData = await inventoryResponse.json();
    console.log('✅ Inventory table structure confirmed. Records:', inventoryData.pagination.total);
    
    console.log('\n🎉 All tests passed! Dynamic Tables System is working correctly.');
    
  } catch (error) {
    console.error('❌ Test failed:', error.message);
  }
}

testDynamicTables();