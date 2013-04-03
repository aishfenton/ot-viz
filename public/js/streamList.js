OT.streamList = function(idKey) {

  var enterFn = function(d) { return d; },
      updateFn = function(d,p) { return d; },
      removeFn = function(d) { return d; };
  
  var streamList = {},
      data = {};

  var enters = [], removes = [], updates = [];
  
  function process(newValues) {
    enters = [], removes = [], updates = [], newData = {};
    
    newValues.forEach(function(d) {
      var id = d[idKey];
      if (id in data) {
        updates.push(d);
        delete data[id];
        newData[id] = d;
      } else {
        enters.push(d);  
        newData[id] = d;
      }
    });
    removes = Object.values(data); 
    data = newData;
    return streamList;
  }

  function clear() {
    data = {};
    enters = [], removes = [], updates = [];
  }

  streamList.process = process;
  streamList.enter  = function(fn) { enters.forEach(fn);  return streamList; }; 
  streamList.remove = function(fn) { removes.forEach(fn); return streamList; }; 
  streamList.update = function(fn) { updates.forEach(fn); return streamList; }; 
  streamList.clear  = clear;
   
  //streamList.data = function() { debugger; return Object.values(data); };
  streamList.entered = function() { return enters; };
  streamList.removed = function() { return removes; };
  streamList.updated = function() { return updates; };

  return streamList;
}
