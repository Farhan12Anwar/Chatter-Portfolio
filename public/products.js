// // File: js/products.js

// document.addEventListener('DOMContentLoaded', () => {
//     const data = [
//       {name: "affan", price: "book me in just 150₹", photo: "/public/css/assets/affan.jpg"},
//       {name: "faizan", price: "book me in just 250₹ + GST + CGST", photo: "/public/css/assets/faizan.jpg"},
//     //   {name: "farhan", price: "book me in just 999₹", photo: "/assets/farh.png"},
//     ];
  
//     const productListing = document.getElementById('product-listing');
  
//     data.forEach(details => {
//       const card = document.createElement('div');
//       card.className = 'card mb-3';
  
//       card.innerHTML = `
//         <div class="card-header">
//           <h3>${details.name}</h3>
//         </div>
//         <div class="card-body">
//           <img src="${details.photo}" alt="${details.name}" width="200" height="200" />
//         </div>
//         <div class="card-footer">
//           <h4>${details.price}</h4>
//         </div>
//       `;
  
//       productListing.appendChild(card);
//     });
//   });
  