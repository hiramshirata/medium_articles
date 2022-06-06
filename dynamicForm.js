function dynamicForm() {
    const ss = SpreadsheetApp.openById('#######');
    const form = FormApp.openByUrl('#######');
  
    // configuring the basics of the form
    let items = form.getItems();
    let item_titles = [];
    let item_ids = [];
  
    items.forEach(function(item){
      item_titles.push(item.getTitle())
      item_ids.push(item.getId())
    })
  
    if (items.length == 0){
      form.setTitle('Appointments for the place1')
      form.addListItem().setTitle('Available dates:')
    }
  
    let available_dates = items[item_titles.indexOf('Available dates:')].asListItem();
  
  
    //creating the options for each date
    let result = getAvailability(ss)
    let dates = result[0]
    let hours = result[1]
    let header = result[2]
  
    let choices = [];
    dates.forEach(function(date,i){
      try {
        var position = item_titles.indexOf(date)
        var page_break_item = form.getItemById(item_ids[position]).asPageBreakItem()
        var page_break_index = page_break_item.getIndex()
        var hours_dropdown = form.getItemById(item_ids[page_break_index+1]).asListItem()
  
        page_break_item.setGoToPage(FormApp.PageNavigationType.SUBMIT)
      } catch (error){
        console.log('not created date',error)
        var page_break_item = form.addPageBreakItem()
        page_break_item.setTitle(date)
        var page_break_index = page_break_item.getIndex()
        hours_dropdown = form.addListItem().setTitle('Available Hours')
        page_break_item.setGoToPage(FormApp.PageNavigationType.SUBMIT)
      }
  
      var choices_hours = []
      hours[i].forEach(function(value,i){
          if(value > 0){
          var num = header[i+1]
          choices_hours.push(hours_dropdown.createChoice(num.toString(), FormApp.PageNavigationType.SUBMIT))
          }
      })
      hours_dropdown.setChoices(choices_hours)
      page_break_item.setTitle(date)
  
      choices.push(available_dates.createChoice(date, page_break_item))
    })
  
    available_dates.setChoices(choices)
  
  
  }
  
  
  function getAvailability(ss){
    let content = ss.getSheetByName('availability').getRange('P6:U20').getValues()
  
    let dates = []
    let hours = []
    let header = []
    content.forEach(function(row,i){
      if(i === 0){
        header = row
      } else if (row[0] !== ''){
        hours.push(row.slice(1).flat(1))
        dates.push(Utilities.formatDate((new Date(row[0])), 'GMT-3' , "yyyy-MM-dd"))
      }
    })
  
    return [dates, hours, header]
  }
  
  
  function onFormSubmitTrigger(e){
    const targetSpreadsheet = SpreadsheetApp.openById('########');
    const targetSheet = targetSpreadsheet.getSheetByName('appointments');
  
    const itemResponses = e.response.getItemResponses();
    const responses = itemResponses.map(itemResponse => itemResponse.getResponse());
  
    var flat_responses = [];
    responses.forEach(function(value){
      if (typeof value === 'string'){
        flat_responses.push(value)
      }
    })
  
    // flat_responses.unshift(e.response.getRespondentEmail());
    var duration = 1
    flat_responses.unshift(new Date());
    flat_responses.push(duration.toString()) // hardcode duration of the appointment for 1 hour
    targetSheet.appendRow(flat_responses);
  }
  
  
  
  function installTrigger(){
      const form = FormApp.openById('#########');
      ScriptApp.newTrigger('onFormSubmitTrigger')
        .forForm(form)
        .onFormSubmit()
        .create();
  }
  
  
  
  function deleteTrigger(triggerId) {
    // Loop over all triggers.
    const allTriggers = ScriptApp.getProjectTriggers();
    for (let index = 0; index < allTriggers.length; index++) {
      ScriptApp.deleteTrigger(allTriggers[index]);
    }
  }
  
  
  