chrome.action.onClicked.addListener(async () => {
    console.log("Extension activated");
  
    const url = "https://excel.codes/years/1/subjects/musculoskeletal-system";
  
    // Open the new tab
    const tab = await chrome.tabs.create({ url });
  
    // Wait for the tab to load, then inject the script
    chrome.tabs.onUpdated.addListener(function listener(tabId, changeInfo) {
      if (tabId === tab.id && changeInfo.status === "complete") {
        
        // Inject content.js
        chrome.scripting.executeScript({
          target: { tabId: tab.id },
          files: ["content.js"]
        }).then(() => {
          console.log("Script injected successfully.");
          
          // Remove the listener to prevent re-injecting
          chrome.tabs.onUpdated.removeListener(listener);
        }).catch(err => console.error("Injection failed:", err));
      }
    });
  
    // Stop the extension after 5 seconds (optional)
    setTimeout(() => {
      console.log("Extension deactivated after 5 seconds.");
    }, 5000);
  });
  