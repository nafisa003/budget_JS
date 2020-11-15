

//module pattern
//BUDGET CONTROLLER
var budgetController=(function(){
    var Expense=function(id,description,value)
    {
        this.id=id;
        this.description=description;
        this.value=value;
        this.percentage=-1;
    };

    Expense.prototype.calcPercentage=function(totalIncome)
    {   if(totalIncome>0)
        this.percentage=Math.round(this.value/totalIncome*100);
        else
        this.percentage=-1;
    };
    Expense.prototype.getPercentage=function()
    {
        return this.percentage;
    }

    var Income=function(id,description,value)
    {
        this.id=id;
        this.description=description;
        this.value=value;
    };

   
    var data=
    {
        allItems:
        {
            exp:[],
            inc:[],
        },
        totals:
        {
            exp:0,
            inc:0
        },
        budget:0,
        percentage:-1
    }
   var  calculateTotal=function (type) {
       var sum=0;
       data.allItems[type].forEach(function(curr) {
           sum+=curr.value;
           
       });
    data.totals[type]=sum;
       
   };
     
    return{
        addItem:function(type,des,val)
        {
            var newItem,ID;

            //create new ID

            if(data.allItems[type].length>0)
            ID=data.allItems[type][data.allItems[type].length-1].id+1;

            else
            ID=0;

            //create new item
            if(type==='exp')
           { newItem=new Expense(ID,des,val);
           }
            else if(type==='inc')
            {
                newItem=new Income(ID,des,val);
            }
            //push new item into ds
            data.allItems[type].push(newItem);
            //return new item
            return newItem;
           
        },


        deleteItem:function(type,id)
        { 
            //id=6
            //data.allitems[type][id]
            //ids=[1 2 4 6 8]
            //index=3
         var ids,index;
          ids=  data.allItems[type].map(function(current)
          {
              return current.id;
          });
          index=ids.indexOf(id);
          if(index!==-1)
          {
              data.allItems[type].splice(index,1);
          }
         
        },

         calculateBudget:function () {

            //calculate total income and expenses
            calculateTotal('exp');
            calculateTotal('inc');

            //calculate budget (income-expense)
         data.budget=data.totals.inc-data.totals.exp;
            //calculate percentage of income spent
            if(data.totals.inc>0)
           { data.percentage=Math.round((data.totals.exp/data.totals.inc)*100);}
           else
           data.percentage=-1;
         } ,
            calculatePercentages:function()
            {
                data.allItems.exp.forEach(function(curr)
                {
                    curr.calcPercentage(data.totals.inc);

                });
            },
          getPercentages:function()
          {
            var allPerc=data.allItems.exp.map(function(curr)
            {
                 return curr.getPercentage();
            });
            return allPerc;
          },

        getBudget:function () {
            return{
                budget:data.budget,
                totalInc: data.totals.inc,
                totalExp:data.totals.exp,
                percentage:data.percentage,
            }
        },
        testing:function()
        {
            console.log(data);
        }
       
    }

})();



//UI CONTROLLER
var UIController=(function(){
   var DOMstrings={
       inputType:'.add_type',
       inputDescription:'.add_description',
       inputValue:'.add_value',
       inputBtn:'.add_btn',
       incomeContainer:'.income_list',
       expensesContainer:'.expenses_list',
       budgetLabel:'.budget_value',

       incomeLabel:'.budget_income--value',
       expenseLabel:'.budget_expenses--value',
       percentageLabel:'.budget_expenses--percentage',
       container:'.container',
       percLabel:'.item_percentage',
       dateLabel:'.budget_title--month'
       
   }
  var  formatNum=function(num,type)
   {
        /* + or - before num as per type
        , separator for thousands
        exactly two decimal points 
        
        +2340.4567-> +2,340.46
        */
   
        num=Math.abs(num);
        num=num.toFixed(2);
   
      var  numsplit= num.split('.');
      var int=numsplit[0];
      var dec=numsplit[1];
      if(int.length>3)
      {
          int=int.substr(0,int.length-3)+','+int.substr(int.length-3,3);
   
      }
     
       return ( type ==='exp'?'-': '+')+ " " + int+'.'+ dec;
   
   };
   var nodeListForEach=function(list,callback)
   {
    for(var i=0;i<list.length;i++)
    {
        callback(list[i],i);
    }
  };

return{
    getinput:function()
    {
        return {
 type:document.querySelector(DOMstrings.inputType).value,//will be either inc or exp
 description:document.querySelector(DOMstrings.inputDescription).value,
 value:parseFloat( document.querySelector(DOMstrings.inputValue ).value)
        }

    },

    addListItem: function(obj,type)

    {  var html,newHtml,element;
        //create HTML string with placeholder text
        if(type==='inc'){
            element=DOMstrings.incomeContainer;
    html='<div class="item clearfix" id="inc-%id%"><div class="item_description">%description%</div><div class="right clearfix"><div class="item_value">%value%</div><div class="item_delete"> <button class="item_delete--btn"><i class="ion-ios-close-outline"></i></button></div></div></div>';
        }
        else if(type==='exp')
        { 
            element=DOMstrings.expensesContainer;
            html= '<div class="item clearfix" id="exp-%id%"><div class="item_description">%description%</div><div class="right clearfix"> <div class="item_value">%value%</div> <div class="item_percentage">21%</div><div class="item_delete">  <button class="item_delete--btn"><i class="ion-ios-close-outline"></i></button></div></div></div>';

        }

        //replace placeholder with actual data

      newHtml=html.replace('%id%',obj.id);
      newHtml=newHtml.replace('%description%',obj.description);
      newHtml=newHtml.replace('%value%',formatNum(obj.value,type));
        //insert HTML into DOM
  document.querySelector(element).insertAdjacentHTML('beforeend',newHtml);

    },


     deleteListItem:function(selectorID)
     {
         var el=document.getElementById(selectorID);
         el.parentNode.removeChild(el);

        
     },
    clearFields:function()
    {

     var fields=   document.querySelectorAll(DOMstrings.inputDescription+','+DOMstrings.inputValue);
     var fieldsArr=Array.prototype.slice.call(fields);
     fieldsArr.forEach(function(current){
         current.value="";


         
     });
     fieldsArr[0].focus();
    },

    displayBudget:function (obj) {

        var type;
        (obj.budget>0)?type='inc':type='exp';
        
        document.querySelector(DOMstrings.budgetLabel).textContent=formatNum( obj.budget,type);
        document.querySelector(DOMstrings.incomeLabel).textContent=formatNum( obj.totalInc,'inc');
        document.querySelector(DOMstrings.expenseLabel).textContent=formatNum( obj.totalExp,'exp');
        if(obj.percentage>0){
        document.querySelector(DOMstrings.percentageLabel).textContent=obj.percentage+'%';
        }
        else
        document.querySelector(DOMstrings.percentageLabel).textContent='----';
    },



displayPercentages:function(percentages)
    {
var fields=document.querySelectorAll(DOMstrings.percLabel);


      nodeListForEach(fields,function(curr,index)
{    if(percentages[index]>0)
    curr.textContent=percentages[index]+'%';
    else
    curr.textContent='---';
});
    },



    displayMonth:function()
    {  var now,year,mont,months;
        now=new Date();//using date obj constructor//display's today's date
         
        months=['January','February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November',
    'December'];
        year=now.getFullYear();
        month=now.getMonth();

        document.querySelector(DOMstrings.dateLabel).textContent=months[month]+" " + year;
         

    },
    changeType:function()
    {
         var fields;
         fields=document.querySelectorAll(DOMstrings.inputType
            +',' +DOMstrings.inputValue+','
            +DOMstrings.inputDescription);
      nodeListForEach(fields,function(curr){
          curr.classList.toggle('red-focus');
      });
      document.querySelector(DOMstrings.inputBtn).classList.toggle('red');
        
    },

    getDOMstrings: function()
    {
        return DOMstrings;
    },
}


})();




//GLOBAL APP CONTROLLER
var controller=(function(budgetCtrl,UIctrl){



 var setupEventListeners=function()
 {
    var DOM=UIctrl.getDOMstrings();
    document.querySelector(DOM.inputBtn).addEventListener('click',CtrlAddItem);
  


    document.addEventListener('keypress',function(event)
    {
        if(event.keyCode===13|| event.which===13)
       {
    
        CtrlAddItem();
    
       }
    })
    document.querySelector(DOM.container).addEventListener('click',ctrlDeleteItem);

    document.querySelector(DOM.inputType).addEventListener('change',UIctrl.changeType);
 };
 
 var updateBudget=function()
 {
      //Update the budget
    budgetCtrl.calculateBudget()

      //return the budget
   var budget=budgetCtrl.getBudget();
   //Display budget on UI
  // console.log(budget);
 UIctrl.displayBudget(budget);
 };




var updatePercentages=function()
{
    //calculate percentages
budgetCtrl.calculatePercentages();


    //read percentages from the budget controller
 var percentages=  budgetCtrl.getPercentages();
 //console.log(percentages);

    //update UI with new percentages

    UIctrl.displayPercentages(percentages);
};



var CtrlAddItem=function()
{  var input,newItem;
      //Get the field input data
       input=UIctrl.getinput();


   //Add the item to the budget controller

  if(input.description!=="" && !isNaN(input.value)&& input.value>0)
 {newItem=  budgetCtrl.addItem(input.type,input.description,input.value);
   //Add the item to the UI
   UIctrl.addListItem(newItem,input.type);



   //clear the fields
   UIctrl.clearFields();
  
   //calculate and update budget
   updateBudget();

   //calculate and update percentages

   updatePercentages();
 }
  
};
var ctrlDeleteItem=function(event)
{var itemID,splitID,type,ID;
 itemID=(event.target.parentNode.parentNode.parentNode.parentNode.id);

if(itemID)
{
    //inc-1
splitID=itemID.split('-');
type=splitID[0];
ID=parseInt(splitID[1]);

//delete the item from the data structure
budgetCtrl.deleteItem(type,ID);
//delete item from UI
UIctrl.deleteListItem(itemID);
//update and show new budget
updateBudget();

  //calculate and update percentages

  updatePercentages();

}


};
return {
init:function()
{   console.log('app has started') ;
UIctrl.displayMonth();
    UIctrl.displayBudget({
        budget:0,
        totalInc:0,
        totalExp:0,
        percentage:-1,
    })
   
    setupEventListeners();
}
}

})(budgetController,UIController);

controller.init();