document.addEventListener('DOMContentLoaded',()=>{
    const inputText=document.getElementById('inputText');
    const depthInput=document.getElementById('depthInput');
    const unitWordRadio=document.getElementById('unitWord');
    const unitCharRadio=document.getElementById('unitChar');
    const buildChainBtn=document.getElementById('buildChain');
    const generateCountInput=document.getElementById('generateCount');
    const generateTextBtn=document.getElementById('generateText');
    const outputArea=document.getElementById('outputArea');
    const errorArea=document.getElementById('errorArea');

    let markov={};
    let d=1;
    let type='word';

    function serr(m){
        errorArea.textContent=m;
        errorArea.style.display='block';
    }

    function herr(){
        errorArea.textContent='';
        errorArea.style.display='none';
    }

    function buildMarkovChain(){
        herr();
        markov={};
        d=parseInt(depthInput.value,10);
        type=document.querySelector('input[name="unitType"]:checked').value;

        if(isNaN(d)||d<1){
            serr("参照深度は1以上の整数でお願いします...！");
            return;
        }

        const text=inputText.value.trim();
        if(text.length===0){
            serr("学習用テキストの入力をお願いします...！");
            return;
        }

        let u=[];
        if(type==='word'){
            const p=text
                .replace(/([.,!?;:])/g,' $1 ')
                .replace(/\s+/g,' ')
                .toLowerCase();
            u=p.split(' ').filter(a=>a.length>0);
        }else u=text.toLowerCase().split('');
        
        if(u.length<d+1) {
            serr(`テキストが短すぎます...！参照深度 ${d} に対応するには、少なくとも ${d+1} 個の${type==='word'?'単語':'文字'}が必要です...！`);
            return;
        }

        for(let i=0;i<u.length-d;i++){
            const p=u.slice(i,i+d).join('');
            const nu=u[i+d];

            if(!markov[p])markov[p]=[];
            markov[p].push(nu);
        }

        console.log("マルコフ連鎖構築完了:",markov);
        alert(`マルコフ連鎖が構築されました～！ (${type==='word'?'単語':'文字'}ベース, N=${d})`);
        generateTextBtn.disabled=false;

        generateCountInput.previousElementSibling.textContent=`生成する文章の${type==='word'?'単語数':'文字数'}:`;
    }

    function generateWordSalad(){
        herr();
        outputArea.textContent='';

        if(Object.keys(markov).length===0){
            serr("先に「マルコフ連鎖を構築」ボタンを押してください...！");
            return;
        }

        const c=parseInt(generateCountInput.value,10);
        if(isNaN(c)||c<1){
            serr(`生成する${type==='word'?'単語数':'文字数'}は1以上の整数でお願いします...！`);
            return;
        }

        const ps=Object.keys(markov).filter(p=>p.length===d);
        if(ps.length===0) {
            serr("マルコフ連鎖データに有効な開始プレフィックスがありません...！テキストのご確認をお願いします！");
            return;
        }
        let cp=ps[Math.floor(Math.random()*ps.length)];
        let genius=cp.split('');

        for(let i=0;i<c-d;i++){
            const pnu=markov[cp];

            if(!pnu||pnu.length===0){
                console.warn("次の単位が見つかりませんでした！新しいプレフィックスから再開しますね...！");
                cp=ps[Math.floor(Math.random()*ps.length)];
                if(!markov[cp]||markov[cp].length===0){
                    console.warn("利用可能なプレフィックスがありません...！生成を停止します...！");
                    break; 
                }
                genius=genius.concat(cp.split(''));
                continue;
            }

            const n=pnu[Math.floor(Math.random()*pnu.length)];
            genius.push(n);

            cp=genius.slice(genius.length-d).join('');
        }

        let r='';
        if(type==='word'){
            r=genius.join(' ');
            r=r.replace(/\s([.,!?;:])/g,'$1');
            if(r.length>0&&/[a-z]/.test(r[0]))r=r.charAt(0).toUpperCase()+r.slice(1);
        }else r=genius.join('');
        outputArea.textContent=r;
    }

    buildChainBtn.addEventListener('click',buildMarkovChain);
    generateTextBtn.addEventListener('click',generateWordSalad);
    unitWordRadio.addEventListener('change',()=>generateTextBtn.disabled=true);
    unitCharRadio.addEventListener('change',()=>generateTextBtn.disabled=true);
    depthInput.addEventListener('change',()=>generateTextBtn.disabled=true);
    inputText.addEventListener('input',()=>generateTextBtn.disabled=true);

    generateTextBtn.disabled=true;
});