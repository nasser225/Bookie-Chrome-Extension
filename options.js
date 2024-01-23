// Author: tooldev.nasser@gmail.com
// Utility fuctions
function IsValidJSON(text){
    if (typeof text!=="string"){
        return false;
    }
    try{
        var json = JSON.parse(text);
        return (typeof json === 'object');
    }
    catch (error){
        return false;
    }
}

async function getCurrentTab() {
    // `tab` will either be a `tabs.Tab` instance or `undefined`.
    let [tab] = await chrome.tabs.query({ active: true, lastFocusedWindow: true });
    return tab;
};

// retrieve page name and link, append to list / refresh
let bookmarks=[]; 

chrome.storage.local.get(['storedBookmarks'], (result) => {

    if(IsValidJSON(result.storedBookmarks))
    {
        bookmarks = JSON.parse(result.storedBookmarks);

        // Iterate through array and populate HTML
        bookmarks.forEach(bm => {
            let trStart = "<tr>";
            let trEnd = "</tr>";

            let pTitle = trStart;
            pTitle += (bm.bTitle).link(bm.bUrl) + "<br>";
            
            let pOpenDateTime = (bm.bDate) + " " + (bm.bTime) + "<br>";
            pOpenDateTime += trEnd;

            document.getElementById('pageTitle').innerHTML += pTitle;
            document.getElementById('scheduledTime').innerHTML += pOpenDateTime;
        });
    }
});

// Delete list of bookmarks on request //
let btn = document.getElementById('deleteBtn');
btn.onclick = function(){

    if (confirm('Are you sure you want to save this thing into the database?')) 
    {
        chrome.storage.local.set({ ['storedBookmarks']: {} });

        location.reload();
    }
}

async function checkForNewTab(bmUrl,bmTitle) {
    await chrome.tabs.query({},function(tabs)
    {
        let boolCheck = false;

        // Check all open tabs for existing URL
        tabs.forEach(function(tab){
            if(tab.url == bmUrl)
            {
                boolCheck = true;
            }

            if(boolCheck)
            {
                return;
            }
        });

        if(!boolCheck)
        {
            chrome.tabs.create({
                url: bmUrl
            });

            let notifOptions = {
                type: 'basic',
                iconUrl: 'icon48.png',
                title: 'Bookie notification:',
                message: 'Your bookmarked page ' +'[' +  bmTitle + ']' + ' has opened as scheduled. Woohoo!'
              }
        
            chrome.notifications.create('openTabNotify', notifOptions);
        }
     });
};

function checkForActiveBookMark() {
    // Check local time
    let localDateTime = new Date().toLocaleString('en-GB');

    let splitTime = localDateTime.split(',')[1];

    let splitDate = localDateTime.split(',')[0];

    let hours = splitTime.slice(1, 3);
    let minutes = splitTime.slice(4, 6);

    // Add auto time launch feature here... //
    bookmarks.forEach(bm => {
        let bHour = bm.bTime.slice(0,2);
        let bMin = bm.bTime.slice(3,6);

        let bmDay = bm.bDate.slice(0, 2);
        let bmMonth = bm.bDate.slice(3, 5);
        let bmYear = bm.bDate.slice(6, 10);

        let localDay = splitDate.slice(0, 2);
        let localMonth = splitDate.slice(3, 5);
        let localYear = splitDate.slice(6, 10);

        if(bHour == hours 
            && bMin == minutes 
            && bmDay == localDay 
            && bmMonth == localMonth 
            && bmYear == localYear)
        {
            // Check if tab is already open for this bookmark //
            checkForNewTab(bm.bUrl, bm.bTitle);
        }
    });
}

setInterval(checkForActiveBookMark, 1000);