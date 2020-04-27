var stateOfGame= ["welcome", "setup", "battle"];
var niz = new Map();
var shipColor= "green";
var mousepresed=false;
var user=['blue', 'aqua'];
var usersturn= sessionStorage.getItem("state")=="setup"? 0:1;
var NUMROWS=10;
var NUMCOLS=10;
var availableShips = [4,3,2,1];
var aliveShips = [[4,3,2,1],[4,3,2,1]];
var numhits = [[0,0,0,0],[0,0,0,0]];
var hitmap= new Map();
var allShips= [ [], [] ];
var gameover=false;


var srcIcons= ["assets/user.png", "assets/user2.png"];



$(document).ready(function(){
    configureBackButton();
    
    generateIds();
   

$("#btnusers").on({
    click: function(){
        let flag=true;
        $("#p1").css({"border-color": "blue"});
        $("#p2").css({"border-color": "aqua"});
        let rex= /^[a-zA-Z1-9_]{3,15}$/
        if( ! rex.test($("#p1").val())) {
            flag=false;
            $("#p1").css({"border-color": "red"});
        } 
        if( ! rex.test($("#p2").val())) {
            flag=false;
            $("#p2").css({"border-color": "red"});
        }
        
        if(!flag) return;
        sessionStorage.setItem("user1", $("#p1").val());
        sessionStorage.setItem("user2" ,$("#p2").val());
        $("body").fadeOut(function(){
            sessionStorage.setItem("state", "setup");
            window.location='battleship-setup.html';});
        
    }
});


$("#ime_korisnika").text(sessionStorage.getItem("user1"));
if(sessionStorage.getItem("state")=="setup"){
   
  resetWithNamesSaved();
$(".polje").on({
    mousedown : function() {
        mousepresed=true;
        setBackground(this, shipColor);
        niz.set(this.id,this);
        
    },
    mouseover:  function(){
        if(mousepresed){
            setBackground(this, shipColor);
            niz.set(this.id,this);
        }
    },
    mouseup: function(){
        mousepresed=false;
        if(check(niz)){
            saveBoat(niz); // also changes user
        } else reset(niz);
    }


});

$(document).mouseup(function (){
    if(mousepresed) {
        mousepresed=false;
        reset(niz);
        
        
    }
});
}
if(sessionStorage.getItem("state")=="battle") {
    
   generateArray();
$(".polje2").click(function(){
    if(gameover)return;
   hit(this);
});
changeUser();

}


});


function setBackground(elem,color) {
                elem.style.backgroundColor= color;
}
function check(niz){
    let flag= true;
    if(niz.size==0) return false;
    if(niz.size>4) flag=false;
    else if(availableShips[niz.size-1]==0) flag=false;
 
   let col=-1;
   let row=-1;
   let arrofId=[];
      niz.forEach(function(val,key){
           
           let  id = parseInt(key);
           arrofId.push(id);
           let i = Math.floor(id/NUMCOLS);
           let j = id%NUMCOLS;
           
           if(row==-1 && col==-1) { row=i ; col= j;}
           else if(row==i) { col=-1;console.log(row);}
           else if(col==j) {row=-1;}
           else flag=false;
           console.log(flag);
           if(checkSelf(i,j)) {niz.delete(key);  flag=false; console.log('usao');}
        else if ( checkUpAndCorners(i,j)||  checkDownAndCorners(i,j) ||  checkLeft(i,j) ||  checkRight(i,j)) {flag=false; console.log('usao ovde');}
         });
        arrofId.sort(function(a,b){return a-b;});
        for(let i=0; i< arrofId.length-1;i++) { //if not connected fields
           if ( Math.floor(arrofId[i]/NUMCOLS) +1 != Math.floor(arrofId[i+1]/NUMCOLS)  && arrofId[i]%NUMCOLS+1 != arrofId[i+1]%NUMCOLS ) flag=false;
        }
    return flag;

}

function changeUser(){
    console.log('usao');
    usersturn= (usersturn+1)%2;
    $("#icon").attr("src", srcIcons[usersturn]);
    $("#ime_korisnika").text(sessionStorage.getItem("user" + (usersturn+1)));
    if(sessionStorage.getItem("state") == "setup")
    for(let i = 0; i < availableShips.length;i++) {
        $("#numboats"+(i+1)).text(availableShips[i]);
    }
    else if(sessionStorage.getItem("state")=="battle") {
        let opponent=(usersturn+1)%2;
        for(let i = 0; i < aliveShips[usersturn].length;i++) {
            $("#numboats"+(i+1)).text(aliveShips[opponent][i]);
            $("#myboats"+(i+1)).text(aliveShips[usersturn][i]);
        }
        drawTables();
    }

}

function drawTables(){
    $(".polje1").css({"background-color": "darkkhaki"});
    $(".polje2").css({"background-color": "darkkhaki"});
   for(let i =0 ; i< sessionStorage.length;i++){
       let key = sessionStorage.key(i);
       if(key.indexOf(user[usersturn])!=-1){
           let arr= key.split(',');
           let i = parseInt(arr[0].substr(arr[0].length-1));
           let j = parseInt(arr[1].substr(0));
           let id = i*NUMCOLS+j;
          
           setBackground($("#"+id)[0], "green");
       }
   } 

   
   
    hitmap.forEach(function(val,key){
        console.log(key);
            if(key.indexOf(user[usersturn])!=-1){
                
                let polje =document.getElementById(val); //moj pogodak polje 0-99
                colorField(polje);
            } else {
                
                let polje =document.getElementById(val-100);
                colorField(polje, (usersturn+1)%2);
            }

    });


}
function saveBoat(niz){
    let arr=[];
    console.log('sacuvao ' + niz.size );
    niz.forEach(function(val,key) {
        let  id = parseInt(key);
        let i = Math.floor(id/NUMCOLS);
        let j = id%NUMCOLS;
        sessionStorage.setItem(user[usersturn]+i + "," + j , niz.size);
        arr.push(id);
    });
    allShips[usersturn].push(arr);
    availableShips[niz.size-1]--;
    $("#numboats"+niz.size).text(availableShips[niz.size-1]);
    niz.clear();
    let sum=0;
    availableShips.forEach(el=>{ sum+= el;})
    if(sum==0){ //all set for one player
            if(usersturn==1) //if all set, engage battle
            {
                $("body").fadeOut(function(){
                    sessionStorage.setItem("state", "battle");
                    sessionStorage.setItem("allships" , JSON.stringify(allShips));
                    window.location='battleship-game.html';});
                
            }

            
            else  
            $("#fading").fadeOut("slow",function(){
                for(let i = 0; i < availableShips.length;i++) availableShips[i]= 4-i;
                changeUser();
                let temp=new Map();
                for(let i = 0; i < 100; i++){
                        temp.set(i+"",document.getElementById(i+""));
                }
                resetColors(temp);
                
                $("#fading").fadeIn("slow");
                
            });
        }
}

function checkUpAndCorners(x,y){
    if(x==0) return false;
     if(sessionStorage.getItem(user[usersturn] + (x-1) +","+y)!=null) return true;
     return checkLeft(x-1,y) || checkRight(x-1,y); //checks upper corners 
}
function checkDownAndCorners(x,y){
    if(x==NUMROWS-1) return false;
     if(sessionStorage.getItem(user[usersturn] + (x+1) +","+y)!=null) return true;
     return checkLeft(x+1,y) || checkRight(x+1,y); //checks lower corners
}
function checkLeft(x,y){
    if(y==0) return false;
     if(sessionStorage.getItem(user[usersturn] + x+","+(y-1))!=null) return true;
     return false;
}
function checkRight(x,y){
    if(y==NUMCOLS-1) return false;
     if(sessionStorage.getItem(user[usersturn] + x +","+(y+1))!=null) return true;
     return false;
}
function checkSelf(x,y){
    if(sessionStorage.getItem(user[usersturn] + x +","+y)!=null) return true;
    return false;
}
function reset(niz){
    resetColors(niz);
    niz.clear();
}
function resetColors(niz){
    niz.forEach(function(val,key) {
        setBackground(val,"darkkhaki")
    });
}

function generateIds(){ //generates ids for td elements
    if(sessionStorage.getItem("state") == "setup"){
    let polja = document.getElementsByClassName("polje");
        
      for(let i = 0 ; i < polja.length; i++) {
        polja[i].setAttribute("id", i);
     }
    } else if(sessionStorage.getItem("state") == "battle"){
        let polja = document.getElementsByClassName("polje1");
        let polja2 = document.getElementsByClassName("polje2"); 
        
          for(let i =0; i < polja.length; i++) {
              
            polja[i].setAttribute("id", i);
                
            polja2[i].setAttribute("id", i+100);
         }
         
     }
     
}
function clearSession(){
    sessionStorage.clear();
}
/******BATTLE MODE***** */

function hit(el){
    
    let id = parseInt(el.id);
    
   
    if(hitmap.get(user[usersturn]+"hit" + id )==null) //if already hitted, return
    hitmap.set(user[usersturn]+"hit" + id , id);
    else return;
    colorField(el);
   
    id%=100;
    let i = Math.floor(id/NUMCOLS);
    let j = id%NUMCOLS;
    let opponent= (usersturn+1)%2;
    checkDestroyed(i,j);
    if(sessionStorage.getItem(user[opponent]+i+","+j)==null) changeUser();
   

}
function generateArray(){
        allShips = JSON.parse(sessionStorage.getItem("allships"));


}

function checkDestroyed(x,y){
    let opponent = (usersturn+1)%2;
    let boatSize= sessionStorage.getItem(user[opponent]+x+ "," + y);
    if (boatSize==null) return;
    let id = x*NUMCOLS+y;
    let destroyed = false;
    for(let i = 0 ; i < allShips[opponent].length;i++) {
        let counter=0;
        let flag=false;
        
        for(let j= 0; j < allShips[opponent][i].length;j++){
            if(allShips[opponent][i][j]==-1) counter++;
            else if(allShips[opponent][i][j]==id) {allShips[opponent][i][j] = -1; counter++; 
                console.log('usao');
                flag=true;}
        }
        if(flag) { // if this is the boat
            if(counter==boatSize) destroyed=true; //if all fields are hit
        }

    }

    if(destroyed) {
        aliveShips[opponent][boatSize-1]--;
        $("#numboats"+boatSize).text(aliveShips[opponent][boatSize-1]);

        let sum = 0;
        aliveShips[opponent].forEach(el=>{sum+=el;}) //checks whether the game is over
        if(sum==0) {
            gameover=true;
            let div =document.getElementById('gameover');
            
            div.innerHTML= '<div id="gameover" class="alert alert-success mt-2"> <h3> The game is over, battle is your\'s!</h3> click to play again</div> '
            div.onclick= function(){ clearSession(); window.location='battleship-welcome.html';}
            
        }
        
    }
    
   
}

function colorField(el, forwho){
    let usersturn= window.usersturn;
    if(forwho!=null) usersturn=forwho;
    let id = parseInt(el.id);
    id%=100;
    let x = Math.floor(id/NUMCOLS);
    let y = id%NUMCOLS;
    let opponent = (usersturn+1)%2;
    if(sessionStorage.getItem(user[opponent]+x+","+y)!=null){
        //el.innerHTML="X";
        setBackground(el,"darkred");
    } else setBackground(el,"orange");

}
function resetWithNamesSaved(){
    let user1 = sessionStorage.getItem("user1");
    let user2 = sessionStorage.getItem("user2");
    sessionStorage.clear();
    sessionStorage.setItem("user1", user1);
    sessionStorage.setItem("user2", user2);
    sessionStorage.setItem("state", "setup");
}
function configureBackButton(){
    if(window.location.href.indexOf('battleship-welcome')!=-1){
        clearSession();

    }else if(window.location.href.indexOf('battleship-setup')!=-1){
        
        if(sessionStorage.getItem('user1')==null) window.location='battleship-welcome.html';
        else 
        resetWithNamesSaved();

    } 
    else if(window.location.href.indexOf('battleship-game')!=-1){
        if(sessionStorage.getItem('user1')==null) window.location='battleship-welcome.html';
        else 
        if(sessionStorage.getItem('allships')==null) window.location='battleship-setup.html';

    } 
}
/*
function configureWindowBackButtonGame(){
        if(sessionStorage.getItem('state')=='game'){
            let answer= confirm("Game will be lost, are you sure?");
            if(answer) {
                resetWithNamesSaved();
                window.location='battleship-setup.html';
            }
        }



}

function configureWindowBackButtonSetup (){
    if(sessionStorage.getItem('state')=='setup'){
        clearSession();
        window.location='battleship-welcome.html';
    }
}*/
