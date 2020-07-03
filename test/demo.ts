

// import * as BLL from '../lib/BLL/cPayBLL';

// debugger;

// let a = BLL.CpayOrderBLL.BuildParameters(":aa,:bb,:cc,", {
//   aa: 'a111',
//   bb: 'b22',
//   cc: 'c333'
// });

function* aa() {

  yield 1;
  yield 2;
  yield 3;
}
var a = aa();


console.log(a.next());
console.log(a.next());
console.log(a.next());
console.log(a.next());
console.log(a.next());

