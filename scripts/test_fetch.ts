async function test() {
  try {
    console.log('Testing with raw fetch...');
    const res = await fetch('http://localhost:3000/api/trpc/command.auditDispatch?batch=1', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        "0": {
          "json": {
            "text": "Reflexionar sobre la inmortalidad del cangrejo"
          }
        }
      })
    });
    
    const text = await res.text();
    console.log('Raw response:', text);
    
    const json = JSON.parse(text);
    console.log('Parsed:', JSON.stringify(json, null, 2));
  } catch (e: any) {
    console.error('Error:', e.message);
  }
}

test();
