

import * as BLL from '../lib/BLL/cPayBLL';

debugger;

let a = BLL.CpayOrderBLL.BuildParameters(":aa,:bb,:cc,", {
  aa: 'a111',
  bb: 'b22',
  cc: 'c333'
});

console.log(a);

