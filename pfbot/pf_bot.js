

        var ChatLog='';
        var MsgCount=0;

        /////////////////////
        var CurrentNode='start';  
        var PreviousNodes=[];



        /////////////////////
        const GCcolorShades = [
            "#243646",
            "#2D4652",
            "#35475F",
            "#3D486B",
            "#454977",
            "#4D4A84",
            "#554B90",
            "#5D4C9C",
            "#654DA8",
            "#6D4EB4",
            "#754FC0",
            "#7D50CC",
            "#8551D8",
            "#8D52E4",
            "#9553F0",
            "#9D54FC",
            "#A556FF",
            "#AC61FF",
            "#B36BFF",
            "#BA76FF",
            "#C281FF",
            "#C98BFF",
            "#D096FF",
            "#D7A1FF",
            "#DEABFF",
            "#E5B6FF",
            "#ECC1FF",
            "#F3CCFF",
            "#FAD6FF",
            "#FFE1FF"
        ];
        


function LoadNextNode() {
    showMessageOnButton('main_button','&#8987;<b>Working..<b>');


        const currentNodeType=getNodeType(CurrentNode);
        
                                const selectedEdge = getSelectedRadioOption();

                                if (selectedEdge) {
                                    appendUserMessage(selectedEdge);
                                    MsgCount++;
                                    log_msg('usr',selectedEdge);
                         

                                    const targetNode = getEdgeTargetNode(selectedEdge);

                                    if (targetNode) {

                                        const targetNodeType = getNodeType(targetNode);
                                        const targetNodeLabel  = getNodeLabel(targetNode);

                                        PreviousNodes.push(CurrentNode);
                                        CurrentNode=targetNode; 
                                        
                                        MsgCount++;
                                        
                                       
                                                    
                                                    if(targetNodeType===2){
                                                        showUserInputTextArea();
                                                        
                                                                                                       

                                                    }
                                                    else if(targetNodeType===1 || targetNodeType===3){
                                                        var temp_txt='';
                                                        var options_text='';

                                                        if(targetNodeType===3){
                                                            doAPIQuery();
                                                            temp_txt+='Getting results for ';
                                                            options_text+='. I will display the results once I get the required information.';
                                                
                                                        }

                                                    
                                                        

                                                        const connected_edges=getNodeEdges(targetNode);
                                                        
                                                        if(connected_edges.length>0){
                                                            showUserOptionSelectionMenu();
                                                            options_text= options_text+ getEdgeOptionsString(connected_edges);
                                                            
                                                            populateRadioSelect(connected_edges);
                                                            }
                                                        
                                                                                         
                                                        else{
                                                            hideAllUserInputAreas();
                                                            enableItem('back_button');
                                                            disableItem('main_button');
                                                         }

                                                         appendBotMessage(temp_txt+targetNodeLabel+options_text);
                                                        }
                                                       
                                                }
                                                    log_msg('bot',CurrentNode);

                                                    

                                                       setTimeout(function() { 
                                                       showMessageOnButton('main_button','Send'); }, 500);
                                                       
                                                      
                                    }
                                
                                    
                                     
}

        

function sendUserResponse(){
  
    const CurrentNodeType=getNodeType(CurrentNode);
    if(CurrentNodeType===1 || CurrentNodeType===3){
        const available_options= getNodeEdges(CurrentNode);
        if(available_options.length>0){

        if(getSelectedRadioOption()) {
            
            LoadNextNode();
   
        }

        }

    }
    else if(CurrentNodeType===2){
        

        doJugalQuery();
    }  

}


async function doAPIQuery(){

    const currentNodeType=getNodeType(CurrentNode);
    const currentNodeLabel=getNodeLabel(CurrentNode);
        if(currentNodeType===3){
                showMessageOnButton('main_button','&#8987;<b>Working..<b>');
                disableItem('main_button');
                disableItem('back_button');

                const node_ep=getAPINodeEndPoint(CurrentNode);

                const api_resp= await getRestApiData(node_ep);
                // const resp_htm=JSON.stringify(api_resp);
                // const resp_htm=convertJSON_OBJ_ToHTML(api_resp);
                // const resp_htm=convertArrayToHTML(api_resp);
                MsgCount++;
               
                // log_msg('bot',resp_htm);
                appendBotMessage('Here is the required information for <b>'+currentNodeLabel+'</b><br/><br/>');
                createChart(api_resp);
                
               
                // alert(jbresp);

                
                showMessageOnButton('main_button','Send');
                enableItem('main_button');
                enableItem('back_button');
            }
           
}


function createChart(dataJSON){
    const labels= dataJSON[0].value_key
    var json_colors=extractMemberValues(dataJSON,['border_color'],'str');
    var total_values= extractMemberValues(dataJSON,["total_value"],'number');  // this one is used in both line and bar chart
    
    if(labels.length>0){   
        //LINE CHART CREATION


    // createLineChart(jsonData);


    var headers = ['Labels'];
    var h0=extractMemberValues(dataJSON, ["category_title"], 'str');
  
    // console.log('Labels:',h0);
    headers = [headers.concat(h0)];
    var value_keys= dataJSON[0].value_key;    
    // console.log('Value Keys:',value_keys);
    var c_data0 = transposeMatrix(extractMemberValues(dataJSON,["value"], 'number'));
    
    // console.log('cdata0:',c_data0);
    var c_data=[];

    for( var i=0; i<value_keys.length; i++){
        var r=[value_keys[i] ];
        r=r.concat(c_data0[i]);
        c_data.push(r);
    }

    c_data=headers.concat(c_data);
    
    var title_str=prettyTEXT(dataJSON[0].total_key)+' for Indicators\n(Data as on: '+dataJSON[0].last_updated_on+')';
    // console.log('cdata:',c_data);
    var tab_data= c_data.concat( [ (  [dataJSON[0].total_key]  ).concat( total_values) ]  ) ;
    createGoogleChart( c_data,'line',title_str, tab_data , 1, json_colors );
    
    //If additional bar chart needs to be created for label total values
    // var tot_data=transposeMatrix( ( [['LABEL', dataJSON[0].total_key]]).concat(transposeMatrix([h0].concat([total_values])) )  );
    console.log('tab_data:',tab_data);
    log_msg('bot',JSON.stringify(tab_data));
    // createGoogleChart( tot_data, 'bar', 'Grand Total', null,0, json_colors );


    }
    else{
        //BAR CHART CREATION
        // createBarChart(jsonData);
        var c_data=[[dataJSON[0].category_title_key, dataJSON[0].total_key , { role: 'style' }]];
        var tot_sum=sumArray(total_values);
        var tot_line=[['Total',tot_sum]];
        var tab_data= c_data.concat(extractMemberValues(dataJSON,["category_title","total_value"], ['str','number']).concat(tot_line));


        c_data=c_data.concat(extractMemberValues(dataJSON,["category_title","total_value","border_color"], ['str','number','str']));
        // c_data= joinArrayWithMatrixAsCol(c_data,json_colors,{ role: 'style' });
        var title_str=prettyTEXT(prettyTEXT(dataJSON[0].total_key)+' by '+ dataJSON[0].category_title_key)+' \n(Data as on: '+dataJSON[0].last_updated_on+')';
        // console.log('cdata:',c_data);
        console.log('tab_data:',tab_data);
        log_msg('bot',JSON.stringify(tab_data));
        createGoogleChart(c_data,'bar',title_str,tab_data   ,1);
    }
    
}


function sumArray(numbers) {
    let sum = 0;
    for (let i = 0; i < numbers.length; i++) {
      sum += numbers[i];
    }
    return sum;
  }

function createGoogleChart(c_data,c_type,title_str,tbl_data, show_tbl, json_colors){

    const chatMessages = document.querySelector('.chat-messages');
    const botMessageDiv = document.createElement('div');
    const chartDiv = document.createElement('div');
    const cdiv_id= generateRandomString(20);

    chartDiv.id=cdiv_id;
    chartDiv.className = 'chart-element';
    chartDiv.style.width='368px';
    chartDiv.style.height='300px';  

    
    botMessageDiv.className = 'bot-message';
    botMessageDiv.innerHTML = '&#129302;<b><small>Bot</small></b>:<br>';
    botMessageDiv.appendChild(chartDiv);

    if(show_tbl===1){
       
            // Code to be executed after 1 second
            const tbl_div=document.createElement('div');
        tbl_div.innerHTML='<br/>'+createResponsiveTableHTML(tbl_data);
        botMessageDiv.appendChild(tbl_div);
    
    }


    google.charts.load('current', {'packages':['corechart']});
    
      google.charts.setOnLoadCallback(drawChart);

      function drawChart() {
        var data = google.visualization.arrayToDataTable(c_data);
            
        var options = {
          title: title_str,
          legend: { position: 'bottom' },
          colors: json_colors ,     
          
        };

        chatMessages.appendChild(botMessageDiv);
        
        if(c_type==='bar'){

 
            var chart = new google.visualization.BarChart(document.getElementById(cdiv_id));

          } 
          else if(c_type==='line'){
             
            var chart = new google.visualization.LineChart(document.getElementById(cdiv_id));

          }

          setTimeout(function() {
        
            chart.draw(data, options);
            
            chatMessages.scrollTop = chatMessages.scrollHeight;
        
        }, 400);
        
       
        
      

 }

}



function convertJSON_OBJ_ToHTML(jsonObject) {
    console.log(jsonObject);
    
    var html='';
    for (const key in jsonObject) {
        var vals=jsonObject[key];

        if(typeof(vals)==='object'){
            vals=convertJSON_OBJ_ToHTML(vals);
        }

        html += '<b>'+prettyTEXT(key)+'</b>: '+vals+'<br/>';
      
    }
    
  

  return html.replace('<br/><br/><br/>','<br/>');
}

function prettyTEXT(text) {
    try{
// Split the text into words using whitespace as a delimiter
const words = text.split(' ');

// Capitalize the initial letter of each word and join them back together
const capitalizedWords = words.map(word => {
  if (word.length === 0) {
    return word; // Skip empty words
  }
  const firstLetter = word[0].toUpperCase();
  const restOfWord = word.slice(1).toLowerCase();
  return firstLetter + restOfWord;
});

// Join the capitalized words to form the final string
const capitalizedText = capitalizedWords.join(' ');

return capitalizedText.replace('_',' ');
    }
    catch{
        // console.log('IP Not String');
        return '';
    }
  
}

function stringifyWithLineBreaks(obj) {
  // Convert the JSON object to a string with JSON.stringify
  let jsonString = JSON.stringify(obj);

  // Replace newline characters with <br/> tags
  jsonString = jsonString.replace('\n', '<br/>');

  return jsonString;
}



async function getRestApiData(endpointUrl) {
  try {
    const response = await fetch(endpointUrl);

    if (!response.ok) {
      throw new Error(`Error: ${response.status} - ${response.statusText}`);
    }

    const jsonObj = await response.json();
    // console.log('Fetched JSON\n\n'+JSON.stringify(jsonObj));

    return jsonObj;
  } catch (error) {
    console.error("An error occurred while fetching the data:", error);
    return null; 
  }
  
}

function parseStringToNumberIfNumber(str) {
    const floatNumber = parseFloat(str);
    const intNumber = parseInt(str);

    if (!isNaN(floatNumber)) {
        if (floatNumber === intNumber) {
            return intNumber; // It's an integer
        } else {
            return floatNumber; // It's a float
        }
    }

    return str; 
}

function extractMemberValues(jsonArray, memberNames, mem_dtypes) {
    const values = [];
    var val_to_push;
    

    if(memberNames.length===1){
        const memberName=memberNames[0];
        for (let i = 0; i < jsonArray.length; i++) {
            const obj = jsonArray[i];
            if (obj.hasOwnProperty(memberName)) {
                val_to_push=obj[memberName];
                if(mem_dtypes==='number'){
                    if (Array.isArray(val_to_push)) {
                        val_to_push=val_to_push.map(parseStringToNumberIfNumber);
                        
                    } else {
                        val_to_push=parseStringToNumberIfNumber(val_to_push);
                    }


                }
                else if(mem_dtypes==='str'){
                    if (Array.isArray(val_to_push)) {
                        val_to_push=val_to_push.map(String);
                        
                    } else {
                        val_to_push=val_to_push+'';
                    }

                }
 
                values.push(val_to_push);
            }
        }
        
        return values;
    }
    else if (memberNames.length>1){
    
    for (let i = 0; i < jsonArray.length; i++) {
        const obj = jsonArray[i];
        const extractedValues = [];
        
        for (let j = 0; j < memberNames.length; j++) {
            const memberName = memberNames[j];
            if (obj.hasOwnProperty(memberName)) {
                val_to_push=obj[memberName];
                if(j>0){
                    if(mem_dtypes[j]==='number'){
                        val_to_push=parseStringToNumberIfNumber(val_to_push);
    
                    }
                    else if(mem_dtypes[j]==='str'){
                        val_to_push=val_to_push+'';
    
                    }
                    
                }
                else if (j===0){
                    val_to_push=val_to_push+'';
                }

                extractedValues.push(val_to_push);
            }
        }
        
        values.push(extractedValues);
    }
    
    return values;
}
else{
console.log('memberNames not provided.');
    return null;
}
}



function createResponsiveTableHTML(data) {
    var tableHTML = '<div style="max-width: 350px; overflow-x: auto;">';
    tableHTML += '<table class="responsive-table">';

    data.forEach((rowData, rowIndex) => {
        tableHTML += '<tr>';

        rowData.forEach((cellData, cellIndex) => {
            var cellTag;
            if(rowIndex===0){
                cellData= prettyTEXT(cellData);
                cellTag = 'th';
            }
            else{
                cellTag  = 'td';   
            }
            
            tableHTML += `<${cellTag}>${cellData}</${cellTag}>`;
        });

        tableHTML += '</tr>';
    });

    tableHTML += '</table></div>';
    return tableHTML;
}




function transposeMatrix(matrix) {
    const numRows = matrix.length;
    const numCols = matrix[0].length;

    // Initialize a new matrix with the transposed dimensions
    const transposedMatrix = new Array(numCols);
    for (let i = 0; i < numCols; i++) {
        transposedMatrix[i] = new Array(numRows);
    }

    // Populate the transposed matrix
    for (let row = 0; row < numRows; row++) {
        for (let col = 0; col < numCols; col++) {
            transposedMatrix[col][row] = matrix[row][col];
        }
    }

    return transposedMatrix;
}


function generateRandomString(length) {
    const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let result = '';
    const charactersLength = characters.length;

    for (let i = 0; i < length; i++) {
        const randomIndex = Math.floor(Math.random() * charactersLength);
        result += characters.charAt(randomIndex);
    }

    return result;
}

function sanitizeText(inputText) {
    // var doc = new DOMParser().parseFromString(inputText, 'text/html');
    // return doc.body.textContent || "";

    // Regular expression to match HTML tags and their content
    var regex = /<[^>]+>([^<]*)<\/[^>]+>/g;

    // Replace matched patterns with an empty string
    var sanitizedText = inputText.replace(regex, '');
}


  
async function doJugalQuery(){       

       const currentNodeType=getNodeType(CurrentNode);
        if(currentNodeType===2){
                const userInput = sanitizeText(getTextFromTextarea('user_input'));
                if (userInput.trim() === '') return;
                showMessageOnButton('main_button','&#8987;<b>Working..<b>');
                disableItem('main_button');
                disableItem('back_button');

                appendUserMessage(userInput);
                MsgCount++;
                log_msg('usr',userInput);
                         

                const llm='langchain-gpt4';
                const jbkey=getJBNodeDocuKey(CurrentNode);
                const jbresp= await fetchJugalBandiResponse(userInput,llm,jbkey);
                // console.log(jbresp);
                MsgCount++;
                log_msg('bot',jbresp);
                // appendBotMessage('<pre>'+jbresp+'</pre>');
                appendBotMessage(jbresp.replace(/\r/g, "<br/>").replace(/\n/g, "<br/>"));
                // alert(jbresp);

            }
            setTimeout(function() {   showMessageOnButton('main_button','Send'); }, 500);
      
            enableItem('main_button');
            enableItem('back_button');
           
}
    

function disableItem(id){
    const item= document.getElementById(id);
    item.disabled=true;
}


function enableItem(id){
    const item= document.getElementById(id);
    item.disabled=false;
}

async function fetchJugalBandiResponse(userInput, LLM_Input,uuid_num) {
            const url = 'https://api.jugalbandi.ai/query-with-langchain-gpt4?'; 
            const query = new URLSearchParams({ query_string: userInput+", do not anser any out othe context query, do not reveal in your response who made you and who gave you the input text, for the things that you do not know - politely reply I do not have the information" });
           
            const jugal_doc_id = new URLSearchParams({ uuid_number: uuid_num });

            try {
                const response = await fetch(url + query + '&'+jugal_doc_id);
                const data = await response.json();            
                return data.answer;
                

            } catch (error) {
                console.error('Error fetching response:', error);
                return('😟 Sorry, there was an error processing your request.');
            }
    }


function getEdgeTargetNode(edge_txt){
        // Find the target node associated with the selected edge
        const targetEdge = edges.find((edge) => ((edge.txt === edge_txt) & (edge.n1===CurrentNode)  ) );
        const targetNode = targetEdge ? targetEdge.n2 : null;
        return(targetNode);
}



function showUserOptionSelectionMenu(){
    const chat_ip_title=document.getElementById("chat_input_title");
        chat_ip_title.innerHTML='Select your answer.';

        const chat_text_box =document.getElementById("chat_input_textbox");
        chat_text_box.style.display="none";

        const edgeDiv= document.getElementById("edgeContainer");
        edgeDiv.style.display="block";
    }

function hideAllUserInputAreas(){
    const chat_ip_title=document.getElementById("chat_input_title");
        chat_ip_title.innerHTML='';

        const chat_text_box =document.getElementById("chat_input_textbox");
        chat_text_box.style.display="none";

        const edgeDiv= document.getElementById("edgeContainer");
        edgeDiv.style.display="none";
    }

function showUserInputTextArea(){
    const chat_ip_title=document.getElementById("chat_input_title");
            chat_ip_title.innerHTML='Type your query.<br/>  <br/> ';
            
            const chat_text_box =document.getElementById("chat_input_textbox");
            chat_text_box.style.display="block";

            const edgeDiv= document.getElementById("edgeContainer");
            edgeDiv.style.display="none";
        }





function getNodeEdges(nid){
    const ne = edges.filter((edge) => edge.n1 === nid);
    // console.log(ne);
    return( ne);

}     

function getEdgeOptionsString(conEdges){
    var options_string='<br/><br/>';
    for (const e of conEdges) {
        options_string=options_string+'&#128073; <i>'+e.txt+'</i><br/>';

    }
    return(options_string);

}
 // Function to populate radio select element
 function populateRadioSelect(connectedEdges) {
               
            const container = document.getElementById('edgeContainer');
            edgeContainer.innerHTML='';

           


            // var options_string='<br/><br/>';

            for (const edge of connectedEdges) {
                
                const radioInput = document.createElement('input');
                radioInput.type = 'radio';
                radioInput.name = 'radio_options'; // Set the same name for all radio inputs
                radioInput.value = edge.txt;
                radioInput.id = 'edge_'+edge.n1+'_'+edge.n2 // Unique ID for each radio input

                // Create a label for the radio input
                const label = document.createElement('label');
                label.innerHTML = edge.txt+'</br>';
                // options_string=options_string+'&#128073; <i>'+edge.txt+'</i><br/>';
                label.setAttribute('for', 'edge_'+edge.n1+'_'+edge.n2);

                // Append the radio input and label to the container
                container.appendChild(radioInput);
                container.appendChild(label);
                
                
                
            }
            // return(options_string);

           
        }
     
function getSelectedRadioOption() {
            const selectedOptionElement = document.querySelector('input[name="radio_options"]:checked');
            if (selectedOptionElement) {
                return selectedOptionElement.value;
                
            } else {
                return false;
            }
        }

function appendUserMessage(message) {
           
            const chatMessages = document.querySelector('.chat-messages');
            const userMessageDiv = document.createElement('div');
            userMessageDiv.className = 'user-message';
            userMessageDiv.innerHTML = ' &#128100;<small><b>You</small></b>:<br>'+message;
            chatMessages.appendChild(userMessageDiv);
            chatMessages.scrollTop = chatMessages.scrollHeight;
          
            
        }
        
function log_msg(agnt,msg){
            var ts=getTimestamp();
            var x=MsgCount+',"'+agnt+'","'+msg+'"';

            ChatLog=ChatLog+x+','+ts+'\n';
           
            submitData(ts,x);
            console.log(ts,x);
            
        }



async function submitData(k, v) {
            const url = 'http://0.0.0.0:8002/submit-data';
           

            const data = {
                [k]: v
            };

            try {
                const response = await fetch(url, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify(data),
                });

                if (!response.ok) {
                    throw new Error(`HTTP error! Status: ${response.status}`);
                }

                const result = await response.json();
                console.log(result);
            } catch (error) {
                console.error('Error:', error);
            }
    }


function getTimestamp() {
            const now = new Date();
            const year = now.getFullYear();
            const month = String(now.getMonth() + 1).padStart(2, '0');
            const day = String(now.getDate()).padStart(2, '0');
            const hours = String(now.getHours()).padStart(2, '0');
            const minutes = String(now.getMinutes()).padStart(2, '0');
            const seconds = String(now.getSeconds()).padStart(2, '0');
            const milliseconds = String(now.getMilliseconds()).padStart(3, '0');

            return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}.${milliseconds}`;
        }


function appendBotMessage(message) {
            const chatMessages = document.querySelector('.chat-messages');
            const botMessageDiv = document.createElement('div');
            botMessageDiv.className = 'bot-message';
            botMessageDiv.innerHTML = '&#129302;<b><small>Bot</small></b>:<br>'+message;
            chatMessages.appendChild(botMessageDiv);
            chatMessages.scrollTop = chatMessages.scrollHeight;
            
    }


function showMessageOnButton(btn_id,message) {
    const button = document.getElementById(btn_id);
    button.innerHTML = message;
}

function getNodeLabel(nid){
            const startNodeObj=nodes.find((node) => node.id === nid);
            return(startNodeObj ? startNodeObj.txt : null);
    
}

function getNodeType(nid){
            const startNodeObj=nodes.find((node) => node.id === nid);
            return(startNodeObj ? startNodeObj.typ : null);
    
}

function getJBNodeDocuKey(nid){
            const startNodeObj=nodes.find((node) => node.id === nid);
            return(startNodeObj ? startNodeObj.dky : null);
    
}

function getAPINodeEndPoint(nid){
    const startNodeObj=nodes.find((node) => node.id === nid);
            return(startNodeObj ? startNodeObj.ep : null);
}

function getTextFromTextarea(textareaId) {
  try {
    // Get the textarea element by its ID
    var textarea = document.getElementById(textareaId);

    // Check if the textarea exists
    if (textarea) {
      // Get the value of the textarea (the text entered)
      var textEntered = textarea.value;
      return textEntered;
    } else {
      // Return an error message if the textarea is not found
      throw new Error("Textarea element not found");
    }
  } catch (error) {
    // Handle the error, e.g., log it or return an error message
    console.error("An error occurred:", error.message);
    return "An error occurred: " + error.message;
  }
}




function speak_text(txt){
    const synth = window.speechSynthesis;
    const utterance = new SpeechSynthesisUtterance(txt);
    utterance.rate = 1.3; // Faster speech
    
    synth.speak(utterance);

}


function LoadLastNode(){

    if (PreviousNodes.length > 0) {
     
        const lastNodeID=PreviousNodes.pop();
        const targetNodeLabel=getNodeLabel(lastNodeID);
        const targetNodeType=getNodeType(lastNodeID);

        CurrentNode=lastNodeID;
        showMessageOnButton('back_button','&#8987;<b>Working..<b>');
        setTimeout(function() { 
            showMessageOnButton('back_button','Back'); }, 500);
        appendUserMessage('&#8624; Back');
        MsgCount++;
        log_msg('usr','..');
        if(targetNodeType===1 || targetNodeType===3  ){
            if(targetNodeType===3){
                                                            
                doAPIQuery();
                
            }

        showUserOptionSelectionMenu();
        const rad_opts=getNodeEdges(lastNodeID);
        var rad_opt_txt ='';
        if (rad_opts.length>0){
            rad_opt_txt=rad_opt_txt+getEdgeOptionsString(rad_opts);
            populateRadioSelect(rad_opts);


        }
        appendBotMessage(targetNodeLabel+rad_opt_txt);
        enableItem('main_button');
        
    }
    else if(targetNodeType===2){
        showUserInputTextArea();
        appendBotMessage(targetNodeLabel);
        
        
    }
    MsgCount++;
    log_msg('bot',CurrentNode);

    }
}

           // Initial setup when the page loads
window.onload =  function () {

    // Call the function to generate the chatbox elements
    // generateChatbox();
    speak_text('Hello and welcome! I am your friendly AI-ChatBot here to assist you in learning more about the incredible work and impact achieved by Peeramal Foundation.');
 
            const chat_ip_div=document.getElementById('chat_input_box');
            const chat_text_box =document.getElementById("chat_input_textbox");
            const btnM_div=document.getElementById('main_button');
            const btnB_div=document.getElementById('back_button');
        
            log_msg('bot','start');                                
                    appendBotMessage(getNodeLabel('start0'));

                    setTimeout(function(){
                            setTimeout(function(){
                                
                              
                                                const start_opts=getNodeEdges('start');
                                                const start_opt_txt=getEdgeOptionsString(start_opts);
                                                    appendBotMessage( getNodeLabel('start') + start_opt_txt );
                                                    populateRadioSelect(start_opts);
                                                    chat_ip_div.style.display = "block"; 
                                                    chat_text_box.style.display = "none";
                                                    btnM_div.style.display = "block";
                                                    btnB_div.style.display = "block";
                                                    
                                                    // speak_text('How can I assist you today!');            
                                        },2000);
                                        
                                     appendBotMessage(getNodeLabel('start1'));
                                    },2000);

                };