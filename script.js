//=============================
// DOM
//=============================

const browseBtn=document.querySelector("#browseBtn");
const midiFile=document.querySelector("#midiFile");

const fileName=document.querySelector("#fileName");
const fileSize=document.querySelector("#fileSize");
const status=document.querySelector("#status");

const convertBtn=document.querySelector("#convertBtn");

const trackList=document.querySelector("#trackList");
const noteList=document.querySelector("#noteList");

const output=document.querySelector("#output");
const progress=document.querySelector(".progress-bar");
const trackCount=document.querySelector("#trackCount");

const copyBtn=document.querySelector("#copyBtn");
//=============================
// UI Functions
//=============================

function showTrack(track){

    noteList.innerHTML="";

    track.notes.forEach((note,index)=>{

        const div=document.createElement("div");

        div.className="note-item";

        div.innerHTML=`
            <b>#${index+1}</b><br>
            ${note.name}<br>
            Time : ${note.time.toFixed(2)}<br>
            Duration : ${note.duration.toFixed(2)}<br>
            Velocity : ${note.velocity.toFixed(2)}
        `;

        noteList.appendChild(div);

    });

}

//=============================
// Converter Engine
//=============================

function convertMidiToSongEvents(midi){

    const songEvents=[];

    midi.tracks.forEach(track=>{

        track.notes.forEach(note=>{

            songEvents.push({

    a:Math.round(note.time*1000)
    b:note.midi

});

        });

    });

    songEvents.sort((a,b)=>a.a-b.a);

    return songEvents;

}

//=============================
// Export Engine
//=============================

function formatTime(value){

    let time=String(+value.toFixed(3));

    if(time.startsWith("0.")){
        time=time.slice(1);
    }

    return time;

}

function minifySongEvents(songEvents){

    return songEvents.map(event=>

        `{a:${formatTime(event.a)},b:${event.b}}`

    ).join(",");

}

function exportSongEvents(songEvents){

    return "globalThis.songEvents=["
        +minifySongEvents(songEvents)
        +"];null;";

}

function optimizeSongEvents(songEvents){

    if(songEvents.length===0) return songEvents;

    const startTime=songEvents[0].a;

    songEvents.forEach(event=>{

        event.a=+(event.a-startTime).toFixed(3);

    });

    return songEvents;

}



//=============================
// MIDI Loader
//=============================

async function loadMidi(file){

    progress.style.width="10%";

    const buffer=await file.arrayBuffer();

    const midi=new Midi(buffer);

    progress.style.width="50%";

    const songEvents=convertMidiToSongEvents(midi);

    optimizeSongEvents(songEvents);

    output.value=exportSongEvents(songEvents);

    trackCount.textContent=midi.tracks.length;

    fileName.textContent="📄 "+file.name;

    fileSize.textContent=
        "Size : "+(file.size/1024).toFixed(1)+" KB";

    trackList.innerHTML="";

    midi.tracks.forEach((track,index)=>{

        const div=document.createElement("div");

        div.className="track-item";

        div.innerHTML=`
            <div class="track-left">
                <div class="track-title">
                    ${track.name || "Track "+(index+1)}
                </div>

                <div class="track-info">
                    Notes : ${track.notes.length}
                </div>
            </div>
        `;

        div.onclick=()=>showTrack(track);

        trackList.appendChild(div);

    });

    progress.style.width="100%";

    status.textContent="🟢 Ready";

}

//=============================
// Event Listeners
//=============================

convertBtn.disabled=true;

browseBtn.onclick=()=>midiFile.click();

midiFile.onchange=()=>{

    const file=midiFile.files[0];

    if(!file) return;

    convertBtn.disabled=false;

    loadMidi(file);

};

copyBtn.onclick=async()=>{

    if(!output.value) return;

    await navigator.clipboard.writeText(output.value);

    copyBtn.textContent="✅ Copied!";

    setTimeout(()=>{

        copyBtn.textContent="📋 Copy Code";

    },1500);

};
