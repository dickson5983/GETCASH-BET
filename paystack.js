callback: function (response) {
  alert('Payment complete! Reference: ' + response.reference);

  fetch('http://localhost:5000/verify-payment', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ reference: response.reference })
  })
    .then(res => res.json())
    .then(data => {
      alert(data.message);
    });
} 