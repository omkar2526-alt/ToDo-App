
let input = document.querySelector("input");
let btn = document.querySelector("button");
let ul = document.querySelector("ul");


btn.addEventListener("click",function(){
  let li = document.createElement("li");
  li.innerText = input.value;

  let delet = document.createElement("button");
  delet.innerText = "delete";
 
  delet.classList.add("delBtn");

  
  
  li.appendChild(delet);
  ul.appendChild(li);
  input.value = "";
});

ul.addEventListener("click",function(event){
    if(event.target.nodeName == "BUTTON"){
      let li = event.target.parentElement; 
      li.remove();
    };
})

// console.log("hi");
// let delBtn = document.querySelectorAll(".delBtn");

// for( delet of delBtn){
//   console.log("hi");
//   delet.addEventListener("click",function(){
//     // console.log("hi");
//     let par = delet.parentElement;
//     console.log(par);
//   })
// }





// btn.innerText = "Click ME";
// btn.setAttribute("button","btn");


// body.append(input);
// body.append(btn);


// // btn.onclick = function(){
// //     alert("HI baby");
// // }

// // btn.onmouseenter = function(){
// //     btn.style.backgroundColor = "red";
// // }

// // btn.onmouseleave = function(){
// //     btn.style.backgroundColor = "white";
// // }


// btn.addEventListener("click",function(){
//     alert("hi");
//     alert("hello");              // this two alerts will not work on above code events
// });

 

// btn.addEventListener("mouseenter",function(){
//         btn.style.backgroundColor = "red"; 
//         btn.style.backgroundColor = "blue"; 

// })
// 
//  let btn = document.querySelector("button");
//  let div = document.querySelector("div");

//  btn.addEventListener("click",function(e){
//   e.preventDefault();
//    console.dir(e.target);
//  });


