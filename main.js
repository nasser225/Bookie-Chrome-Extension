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

/// GET CURRENT TAB AND TAB TITLE FOR BOOKMARK ///
async function getCurrentTab() {
    // `tab` will either be a `tabs.Tab` instance or `undefined`.
    let [tab] = await chrome.tabs.query({ active: true, lastFocusedWindow: true });
    return tab;
};

// Response from promise
let tabTitle, tabUrl;

// Bookmark object
let Bookmark = {
    bTitle: null,
    bUrl: null,
    bDate: null,
    bTime: null
};

let getTabNameAndDisplay = getCurrentTab()
.then((obj) => { 
    Bookmark.bTitle = obj.title;
    Bookmark.bUrl = obj.url;

    let bTitleShort = Bookmark.bTitle.substring(0, 50);

    document.getElementById('pageTitle').innerHTML += bTitleShort;
});

function getVersion(){
    var manifest = chrome.runtime.getManifest();
    
    console.log(manifest.version);

    return manifest.version;
} 

document.getElementById('versionTextLink').innerHTML = "Bookie version: " + getVersion();

// Quick set feature
let quickSetSelection = document.getElementById('quickSet');
quickSetSelection.onchange = function(){

    let updateVal = document.getElementById('quickSet').value;
    console.log('Updated quick set selection to: ' + updateVal);

    let localDateTime = new Date().toLocaleString('en-GB');
    let splitLocDate = localDateTime.split(',')[0];

    let localDay = splitLocDate.slice(0, 2);
    let localMonth = splitLocDate.slice(3, 5);
    let localYear = splitLocDate.slice(6, 10);

    document.getElementById('dateEntryField').value = localYear + '-' + localMonth + '-' + localDay;

    let splitLocTime = localDateTime.split(',')[1];
    let localHour = splitLocTime.slice(1, 3);
    let localMin = splitLocTime.slice(4, 6);

    let updatedMin = localMin + updateVal;

    console.log("localMin: " + localMin);
    console.log("updatedMin" + updatedMin);

    document.getElementById('timeEntryField').value = localHour + ':' + localMin;

    document.getElementById('timeEntryField').stepUp(updateVal);
};

/// SAVE BOOKMARK TO LOCAL STORAGE ///

let bookmarkArray = []; 
let bookmarks;

// Populate with existing bookmarks
chrome.storage.local.get(['storedBookmarks'], (result) => {
    
    if(IsValidJSON(result.storedBookmarks))
    {
        bookmarks = JSON.parse(result.storedBookmarks);

        bookmarks.forEach(bm => {
            bookmarkArray.push(bm);
        });
    }
});

async function updateBookieTab() {
    // `tab` will either be a `tabs.Tab` instance or `undefined`.
    let [bookieTab] = await chrome.tabs.query({ title: "Bookie Extension Options", currentWindow: true });
    
    if(bookieTab !== undefined)
    {
        chrome.tabs.reload(bookieTab.id);
    }

    return bookieTab;
};

let btn = document.getElementById('submitBtn');
btn.onclick = function(){
    // Add date and time
    let requestedDate = document.getElementById('dateEntryField').value;

    var yr = requestedDate.slice(0,4);
    var mo = requestedDate.slice(5,7);
    var d = requestedDate.slice(8,10);

    Bookmark.bDate = d + '-' + mo + '-' + yr;
    Bookmark.bTime = document.getElementById('timeEntryField').value;

    if(Bookmark.bDate && Bookmark.bTime)
    {
        let localDateTime = new Date().toLocaleString('en-GB');
        let splitLocDate = localDateTime.split(',')[0];

        let bmDay = Bookmark.bDate.slice(0, 2);
        let bmMonth = Bookmark.bDate.slice(3, 5);
        let bmYear = Bookmark.bDate.slice(6, 10);

        let localDay = splitLocDate.slice(0, 2);
        let localMonth = splitLocDate.slice(3, 5);
        let localYear = splitLocDate.slice(6, 10);

        let splitLocTime = localDateTime.split(',')[1];
        let localHour = splitLocTime.slice(1, 3);
        let localMin = splitLocTime.slice(4, 6);
        
        let bmHour = Bookmark.bTime.slice(0, 2);
        let bmMin = Bookmark.bTime.slice(3, 5);

        let bDateTimeIsHistorical = false;
        
        if(bmDay < localDay || bmMonth < localMonth || bmYear < localYear || bmHour < localHour || bmMin < localMin)
        {
            bDateTimeIsHistorical = true;
        }

        if(bDateTimeIsHistorical)
        {
            alert("Cannot complete action. Please check and select a valid date / time for your new bookmark.");
            return;
        }
        else
        {
            bookmarkArray.push(Bookmark);

            chrome.storage.local.set({'storedBookmarks' : JSON.stringify(bookmarkArray)});

            // Refresh the bookie tab
            updateBookieTab();

            let notifOptions = {
                type: 'basic',
                iconUrl: 'icon48.png',
                title: 'Bookie notification:',
                message: 'Your bookmarked page ' +'[' +  Bookmark.bTitle + ']' + ' has been scheduled.'
            }
        
            chrome.notifications.create('openTabNotify', notifOptions);
        }
    }
    else
    {
        alert("No date / time set!");
    }
};
