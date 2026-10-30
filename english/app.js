const sentenceWords=[["Yesterday","other"],["Sarah","noun"],["carefully","adv"],["walked","verb"],["to","other"],["the","other"],["old","adj"],["library","noun"],["because","other"],["she","noun"],["wanted","verb"],["a","other"],["new","adj"],["book","noun"]];let selected=-1;const sentence=document.querySelector("#sentence"),selectedLabel=document.querySelector("#selected"),feedback=document.querySelector("#feedback");function draw(){sentence.innerHTML=sentenceWords.map(([word,kind],i)=>'<button class="word" data-i="'+i+'" '+(kind!=="?"?'data-kind="'+kind+'"':'')+'>'+word+'</button>').join(" ");sentence.querySelectorAll(".word").forEach(b=>b.addEventListener("click",()=>{selected=Number(b.dataset.i);sentence.querySelectorAll(".word").forEach(x=>x.classList.toggle("selected",Number(x.dataset.i)===selected));selectedLabel.textContent=sentenceWords[selected][0];feedback.textContent="Choose the grammatical category for this word.";}));}document.querySelector("#choices").addEventListener("click",e=>{const b=e.target.closest("button[data-kind]");if(!b||selected<0)return;const expected=sentenceWords[selected][1];if(b.dataset.kind===expected){feedback.textContent="Correct! "+sentenceWords[selected][0]+" is "+b.textContent.toLowerCase()+". ✓";feedback.style.color="#5ce0a4";sentence.querySelector('[data-i="'+selected+'"]').dataset.kind=expected;}else{feedback.textContent="Not quite. Try again.";feedback.style.color="#ff82b2";}});document.querySelector("#reset").addEventListener("click",()=>{selected=-1;selectedLabel.textContent="Choose a word above";feedback.textContent="Choose a word, then choose its grammatical function.";feedback.style.color="";draw();});draw();const quiz=[["Yesterday",false],["Emma",false],["studied",true],["English",false],["and",false],["wrote",true],["three",false],["sentences",false]];const options=document.querySelector("#verb-options");let picks=new Set();options.innerHTML=quiz.map(([w])=>'<button type="button">'+w+'</button>').join("");options.querySelectorAll("button").forEach((b,i)=>b.addEventListener("click",()=>{if(b.classList.contains("correct")||b.classList.contains("wrong"))return;b.classList.toggle("active");picks.has(i)?picks.delete(i):picks.add(i);}));document.querySelector("#check").addEventListener("click",()=>{let hits=0;quiz.forEach(([w,yes],i)=>{const b=options.children[i];b.classList.remove("active");if(picks.has(i)===yes){b.classList.add("correct");if(yes)hits++;}else b.classList.add("wrong");});document.querySelector("#score").textContent=hits+" / 2 verbs";document.querySelector("#quiz-feedback").textContent=hits===2?"Excellent! You found both verbs.":"Look for the action words: studied and wrote.";});

// Sentence builder: tap shuffled words to reconstruct the target sentence.
const orderData={target:["She","usually","drinks","coffee","in","the","morning."],meaning:"She usually drinks coffee in the morning."};
let orderPicked=[];
const orderBank=document.querySelector("#order-bank"),orderAnswer=document.querySelector("#order-answer");
function renderOrder(){const used=new Set(orderPicked.map(x=>x.id));orderBank.innerHTML=orderData.target.map((w,i)=>({w,i})).sort((a,b)=>((a.i*7+3)%11)-((b.i*7+3)%11)).map(({w,i})=>'<button type="button" data-word="'+i+'" '+(used.has(i)?'disabled':'')+'>'+w+'</button>').join("");orderBank.querySelectorAll("button").forEach(b=>b.addEventListener("click",()=>{orderPicked.push({id:Number(b.dataset.word),word:orderData.target[Number(b.dataset.word)]});renderOrder();}));orderAnswer.textContent=orderPicked.length?orderPicked.map(x=>x.word).join(" "):"Your selected words will appear here…";document.querySelector("#order-progress").textContent=orderPicked.length+" / "+orderData.target.length+" words";}
document.querySelector("#order-meaning").textContent=orderData.meaning;
document.querySelector("#order-reset").addEventListener("click",()=>{orderPicked=[];document.querySelector("#order-feedback").textContent="";renderOrder();});
document.querySelector("#order-undo").addEventListener("click",()=>{orderPicked.pop();document.querySelector("#order-feedback").textContent="";renderOrder();});
document.querySelector("#order-check").addEventListener("click",()=>{const ok=orderPicked.map(x=>x.word).join(" ")===orderData.target.join(" ");const f=document.querySelector("#order-feedback");f.textContent=ok?"Perfect! The sentence is in the correct order. ✓":"Not yet. Check the subject, adverb and verb position.";f.style.color=ok?"#5ce0a4":"#ff82b2";});
renderOrder();

// Contextual grammar choices.
const tenseData=[
 {q:"Yesterday, I ___ to the cinema.",a:["go","went","gone"],correct:1,why:"Yesterday refers to the past: use went (Past Simple)."},
 {q:"She ___ in London since 2022.",a:["lives","lived","has lived"],correct:2,why:"Since + a starting point connects the past to the present: Present Perfect."},
 {q:"Look at those clouds! It ___ .",a:["is going to rain","rained","has rain"],correct:0,why:"A visible sign in the present supports 'be going to' for a prediction."}
];let tenseIndex=0,tenseLocked=false;
function renderTense(){const q=tenseData[tenseIndex];document.querySelector("#tense-question").textContent=q.q;document.querySelector("#tense-count").textContent=(tenseIndex+1)+" / "+tenseData.length;document.querySelector("#tense-feedback").textContent="Choose the best answer.";document.querySelector("#tense-feedback").style.color="";document.querySelector("#tense-next").disabled=true;document.querySelector("#tense-next").textContent=tenseIndex===tenseData.length-1?"Play again":"Next question";const wrap=document.querySelector("#tense-options");wrap.innerHTML=q.a.map((a,i)=>'<button type="button" data-answer="'+i+'">'+a+'</button>').join("");wrap.querySelectorAll("button").forEach(b=>b.addEventListener("click",()=>{if(tenseLocked)return;tenseLocked=true;const ok=Number(b.dataset.answer)===q.correct;wrap.querySelectorAll("button").forEach((x,i)=>{if(i===q.correct)x.classList.add("correct");else if(x===b)x.classList.add("wrong");});const f=document.querySelector("#tense-feedback");f.textContent=(ok?"Correct! ":"Not quite. ")+q.why;f.style.color=ok?"#5ce0a4":"#ff82b2";document.querySelector("#tense-next").disabled=false;}));}
document.querySelector("#tense-next").addEventListener("click",()=>{tenseIndex=(tenseIndex+1)%tenseData.length;tenseLocked=false;renderTense();});renderTense();

// Vocabulary matching.
const matchData=[["borrow","pedir prestado"],["quiet","silencioso/a"],["although","aunque"],["improve","mejorar"]];
let matchSelected=null,matched=new Set();
function renderMatch(){const left=document.querySelector("#match-words"),right=document.querySelector("#match-meanings");left.innerHTML=matchData.map((p,i)=>'<button type="button" data-pair="'+i+'" '+(matched.has(i)?'disabled':'')+'>'+p[0]+'</button>').join("");const order=[...matchData.keys()].sort(()=>Math.random()-.5);right.innerHTML=order.map(i=>'<button type="button" data-pair="'+i+'" '+(matched.has(i)?'disabled':'')+'>'+matchData[i][1]+'</button>').join("");[left,right].forEach(col=>col.querySelectorAll("button").forEach(b=>b.addEventListener("click",()=>{const id=Number(b.dataset.pair);if(col===left){matchSelected=id;left.querySelectorAll("button").forEach(x=>x.classList.toggle("active",Number(x.dataset.pair)===id));document.querySelector("#match-feedback").textContent="Now choose its Spanish meaning.";}else if(matchSelected===null){document.querySelector("#match-feedback").textContent="Choose an English word first.";}else if(matchSelected===id){matched.add(id);matchSelected=null;renderMatch();document.querySelector("#match-feedback").textContent=matched.size===4?"All pairs matched. Excellent! ✓":"Correct match!";document.querySelector("#match-feedback").style.color="#5ce0a4";}else{document.querySelector("#match-feedback").textContent="That pair doesn't match. Try another meaning.";document.querySelector("#match-feedback").style.color="#ff82b2";}})));document.querySelector("#match-progress").textContent=matched.size+" / 4 pairs";}
document.querySelector("#match-reset").addEventListener("click",()=>{matched=new Set();matchSelected=null;document.querySelector("#match-feedback").textContent="Select a word and then its translation.";document.querySelector("#match-feedback").style.color="";renderMatch();});renderMatch();

 
// Activity hub navigation: keep every game in its own dedicated view.
function openActivity(id){document.querySelectorAll(".view").forEach(v=>v.classList.toggle("active",v.id===id));window.scrollTo({top:0,behavior:"smooth"});}
document.querySelectorAll("[data-open]").forEach(b=>b.addEventListener("click",()=>openActivity(b.dataset.open)));
document.querySelectorAll("[data-home]").forEach(b=>b.addEventListener("click",()=>openActivity("view-home")));

/* Expanded exercise banks: new tasks within each game. */
const highlightBank=[
 [["Yesterday","other"],["Sarah","noun"],["carefully","adv"],["walked","verb"],["to","other"],["the","other"],["old","adj"],["library","noun"],["because","other"],["she","noun"],["wanted","verb"],["a","other"],["new","adj"],["book","noun"]],
 [["My","noun"],["brother","noun"],["is","verb"],["extremely","adv"],["kind","adj"],["and","other"],["helps","verb"],["our","neighbors","noun"]],
 [["The","other"],["small","adj"],["dog","noun"],["barked","verb"],["loudly","adv"],["outside","adv"],["last","adj"],["night","noun"]],
 [["They","noun"],["quickly","adv"],["finished","verb"],["their","noun"],["difficult","adj"],["homework","noun"],["before","other"],["dinner","noun"]],
 [["Beautiful","adj"],["flowers","noun"],["grow","verb"],["near","other"],["the","other"],["river","noun"],["in","other"],["spring","noun"]],
 [["I","noun"],["often","adv"],["read","verb"],["interesting","adj"],["stories","noun"],["before","other"],["bed","noun"]],
 [["The","other"],["teacher","noun"],["explained","verb"],["the","other"],["new","adj"],["topic","noun"],["clearly","adv"]],
 [["We","noun"],["are","verb"],["very","adv"],["excited","adj"],["about","other"],["our","noun"],["trip","noun"]]
];
let highlightIndex=0;
function loadHighlight(){sentenceWords.splice(0,sentenceWords.length,...highlightBank[highlightIndex].map(x=>[...x]));selected=-1;selectedLabel.textContent="Choose a word above";feedback.textContent="Choose a word, then choose its grammatical function.";feedback.style.color="";draw();}
document.querySelector("#highlight-next").addEventListener("click",()=>{highlightIndex=(highlightIndex+1)%highlightBank.length;loadHighlight();});
const verbBank=[
 [["Yesterday",false],["Emma",false],["studied",true],["English",false],["and",false],["wrote",true],["three",false],["sentences",false]],
 [["The",false],["children",false],["played",true],["outside",false],["and",false],["laughed",true]],
 [["My",false],["mother",false],["cooks",true],["dinner",false],["every",false],["evening",false]],
 [["We",false],["have",true],["already",false],["finished",true],["the",false],["project",false]],
 [["Tom",false],["is",true],["reading",true],["a",false],["novel",false],["now",false]],
 [["They",false],["will",true],["travel",true],["to",false],["Brazil",false],["next",false],["year",false]],
 [["The",false],["sun",false],["shines",true],["brightly",false],["and",false],["warms",true],["the",false],["earth",false]],
 [["I",false],["did",true],["not",false],["understand",true],["the",false],["question",false]],
 [["She",false],["has",true],["been",false],["learning",true],["English",false],["for",false],["months",false]],
 [["Please",false],["close",true],["the",false],["window",false],["and",false],["sit",true],["down",false]]
];
let verbIndex=0;
function loadVerbGame(){picks=new Set();const data=verbBank[verbIndex];options.innerHTML=data.map(([w])=>'<button type="button">'+w+'</button>').join("");options.querySelectorAll("button").forEach((b,i)=>b.addEventListener("click",()=>{if(b.classList.contains("correct")||b.classList.contains("wrong"))return;b.classList.toggle("active");picks.has(i)?picks.delete(i):picks.add(i);}));document.querySelector("#score").textContent="— / "+data.filter(x=>x[1]).length;document.querySelector("#quiz-feedback").textContent="Select every verb, then check your answers.";document.querySelector("#check").onclick=()=>{let hits=0;data.forEach(([w,yes],i)=>{const b=options.children[i];b.classList.remove("active");if(picks.has(i)===yes){b.classList.add("correct");if(yes)hits++;}else b.classList.add("wrong");});document.querySelector("#score").textContent=hits+" / "+data.filter(x=>x[1]).length;document.querySelector("#quiz-feedback").textContent=hits===data.filter(x=>x[1]).length?"Excellent! You found every verb. ✓":"Look for the action or auxiliary verbs and try another sentence.";};}
document.querySelector("#verbs-next").addEventListener("click",()=>{verbIndex=(verbIndex+1)%verbBank.length;loadVerbGame();});loadVerbGame();
const orderBankData=[
 {target:["She","usually","drinks","coffee","in","the","morning."],meaning:"She usually drinks coffee in the morning."},
 {target:["We","visited","the","museum","last","Saturday."],meaning:"We visited the museum last Saturday."},
 {target:["My","friends","are","watching","a","movie","now."],meaning:"My friends are watching a movie now."},
 {target:["He","doesn't","like","getting","up","early."],meaning:"He doesn't like getting up early."},
 {target:["Have","you","ever","been","to","London?"],meaning:"Have you ever been to London?"},
 {target:["They","will","probably","arrive","after","lunch."],meaning:"They will probably arrive after lunch."},
 {target:["I","was","doing","my","homework","when","she","called."],meaning:"I was doing my homework when she called."},
 {target:["There","are","some","books","on","the","table."],meaning:"There are some books on the table."},
 {target:["If","it","rains,","we","will","stay","at","home."],meaning:"If it rains, we will stay at home."},
 {target:["She","has","worked","here","for","five","years."],meaning:"She has worked here for five years."}
];
let orderIndex=0;orderData.target=orderBankData[0].target;orderData.meaning=orderBankData[0].meaning;
function shuffleWords(arr){const a=[...arr];for(let i=a.length-1;i>0;i--){const j=Math.floor(Math.random()*(i+1));[a[i],a[j]]=[a[j],a[i]];}return a;}
renderOrder=function(){const used=new Set(orderPicked.map(x=>x.id));orderBank.innerHTML=shuffleWords(orderData.target.map((w,i)=>({w,i}))).map(({w,i})=>'<button type="button" data-word="'+i+'" '+(used.has(i)?'disabled':'')+'>'+w+'</button>').join("");orderBank.querySelectorAll("button").forEach(b=>b.addEventListener("click",()=>{orderPicked.push({id:Number(b.dataset.word),word:orderData.target[Number(b.dataset.word)]});renderOrder();}));orderAnswer.textContent=orderPicked.length?orderPicked.map(x=>x.word).join(" "):"Your selected words will appear here…";document.querySelector("#order-progress").textContent=orderPicked.length+" / "+orderData.target.length+" words";};
document.querySelector("#order-reset").addEventListener("click",()=>{orderIndex=(orderIndex+1)%orderBankData.length;orderData.target=orderBankData[orderIndex].target;orderData.meaning=orderBankData[orderIndex].meaning;document.querySelector("#order-meaning").textContent=orderData.meaning;orderPicked=[];document.querySelector("#order-feedback").textContent="";renderOrder();});
const expandedTenses=[
 {q:"Yesterday, I ___ to the cinema.",a:["go","went","gone"],correct:1,why:"Yesterday refers to the past: use went (Past Simple)."},
 {q:"She ___ in London since 2022.",a:["lives","lived","has lived"],correct:2,why:"Since + a starting point connects the past to the present: Present Perfect."},
 {q:"Look at those clouds! It ___ .",a:["is going to rain","rained","has rain"],correct:0,why:"A visible sign supports 'be going to' for a prediction."},
 {q:"He usually ___ breakfast at seven.",a:["have","has","is having"],correct:1,why:"For he/she/it in Present Simple, add -s: has."},
 {q:"Listen! Someone ___ at the door.",a:["knocks","is knocking","knocked"],correct:1,why:"An action happening now takes Present Continuous."},
 {q:"When I was young, I ___ in a small town.",a:["live","lived","have lived"],correct:1,why:"A finished period in the past takes Past Simple."},
 {q:"We ___ dinner when the phone rang.",a:["had","were having","have had"],correct:1,why:"Past Continuous describes the ongoing background action."},
 {q:"She ___ her keys, so she can't open the door.",a:["lost","has lost","loses"],correct:1,why:"Present Perfect links the past event to its present result."},
 {q:"I think people ___ more electric cars in the future.",a:["will use","used","are using yesterday"],correct:0,why:"Will is commonly used for predictions about the future."},
 {q:"By the time we arrived, the film ___ .",a:["starts","had started","has started"],correct:1,why:"Past Perfect marks an event completed before another past event."},
 {q:"They ___ for the bus at the moment.",a:["wait","are waiting","waited"],correct:1,why:"At the moment signals Present Continuous."},
 {q:"Water ___ at 100°C at sea level.",a:["boils","is boiling","boiled"],correct:0,why:"A general fact takes Present Simple."},
 {q:"I ___ him three times this week.",a:["saw","have seen","see"],correct:1,why:"An unfinished time period can take Present Perfect."},
 {q:"If you study, you ___ the exam.",a:["passed","will pass","would passed"],correct:1,why:"First conditional: If + Present Simple, will + base verb."},
 {q:"She ___ TV when I called her.",a:["watched","was watching","has watched"],correct:1,why:"Past Continuous describes what was in progress when another event happened."}
];
tenseData.splice(0,tenseData.length,...expandedTenses);
const expandedMatches=[
 ["borrow","pedir prestado"],["quiet","silencioso/a"],["although","aunque"],["improve","mejorar"],["throughout","a lo largo de"],["afford","poder permitirse"],["reliable","confiable"],["instead","en lugar de"],["avoid","evitar"],["aware","consciente"]
];
matchData.splice(0,matchData.length,...expandedMatches);
renderMatch();
