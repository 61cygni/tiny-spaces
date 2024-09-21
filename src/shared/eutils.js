
// Function to download data to a file
export function download(data, filename, type) {
    var file = new Blob([data], {type: type});
    if (window.navigator.msSaveOrOpenBlob) // IE10+
        window.navigator.msSaveOrOpenBlob(file, filename);
    else { // Others
        var a = document.createElement("a"),
                url = URL.createObjectURL(file);
        a.href = url;
        a.download = filename;
        document.body.appendChild(a);
        a.click();
        setTimeout(function() {
            document.body.removeChild(a);
            window.URL.revokeObjectURL(url);  
        }, 0); 
    }
}

export function readFile(fileUrl, callme) {
    return fetch(fileUrl)
        .then(response => {
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            return response.text(); // or response.json() for JSON files
        })
        .then(contents => {
            callme(contents); // You can process the contents here or return them
        })
        .catch(error => {
            console.error('Error reading file:', error);
        });
}

export function doimport (str) {
    if (globalThis.URL.createObjectURL) {
      const blob = new Blob([str], { type: 'text/javascript' })
      const url = URL.createObjectURL(blob)
      const module = import(url)
      URL.revokeObjectURL(url) // GC objectURLs
      return module
    }
    
    const url = "data:text/javascript;base64," + btoa(moduleData)
    return import(url)
  }

