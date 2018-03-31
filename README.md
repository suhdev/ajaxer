# ajaxer 

An HttpClient library to abstract AJAX functionality with support for cancellation. 


```typescript

import {AjaxClient} from 'ajaxer'; 

var a = new AjaxClient(); 

a.get({
    url:'/',
    handler:(req)=>{
        console.log('ze');
        req.cancel();
    }
})
.then(e=>{
    console.log(e);
},e=>{
    console.log('cancelled',e)
});


```