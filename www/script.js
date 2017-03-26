/* 
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */

var prevodnik = {
    form: null,
    currencyLabel: null,
    currenciesDatalist: null,
    
    data: null,
    currency: null,
	conversionDate: null,
	lang: null,
	sse: null,
	url: "http://homel.vsb.cz/~mor03/TAMZ/cnb_json.php",
    init: function(){
        this.form = document.getElementById("currencies_form");
		this.conversionDate = (new Date()).iso();
		this.lang = this.form.lang.value;
		document.body.setAttribute('lang', this.lang);
		this.loadCurrencies();
        this.currencyLabel = document.getElementById("currency_label");
        this.currenciesDatalist = document.getElementById("currencies");
		
		this.form.date.value = this.conversionDate;
		this.form.currency.value = localStorage.getItem("currency") || "";
		
		this.currency = this.form.currency.value;
		if(this.currency)
			this.currencyChanged();
		
		$("#date").bind('datebox', function(e, passed){ 
			if(passed.method === 'set') {
				prevodnik.conversionDate = passed.value;
				prevodnik.loadCurrencies();
			}
		});
    },
	getUrlWithParams: function(){
		return this.url+"?sse=y&date="+encodeURIComponent(this.conversionDate)+"&lang="+encodeURIComponent(this.lang);
	},
    loadCurrencies: function(){
        /*$.get("http://homel.vsb.cz/~mor03/TAMZ/cnb_json.php", function(json){
            prevodnik.data = json;
            if(callback)
                callback();
        });*/
		if(this.sse){
			delete this.sse;
		}
		this.sse = new EventSource(this.getUrlWithParams());
		this.sse.onmessage = function(event) {
			prevodnik.data = JSON.parse(event.data);
			prevodnik.updateCurrenciesList();
			prevodnik.amountChanged();
		};
    },
    updateCurrenciesList: function(){
        this.currenciesDatalist.innerHTML = "";
        for(var i = 0; i < this.data.data.length; i++){
            this.currenciesDatalist.innerHTML += '<option value="'+this.data.data[i].code+'">'+this.data.data[i].country_label+' - '+this.data.data[i].curr_label+' ('+this.data.data[i].code+')</option>';
        }
    },
    currencyChanged: function(){
        this.currency = this.form.currency.value;
        this.currencyLabel.innerText = this.currency+":";
		localStorage.setItem("currency", this.form.currency.value);
		this.amountChanged();
    },
    amountChanged: function(direction){
		if(!this.data)
			return;
        var currency_data;
        for(var i = 0; i < this.data.data.length; i++){
            if(this.data.data[i].code == this.currency){
                currency_data = this.data.data[i];
                break;
            }
        }
        if(!currency_data)
            return;

        if(direction)
            this.form.amount_czk.value = this.form.amount_cur.value*(currency_data.rate/currency_data.unit)
        else
            this.form.amount_cur.value = this.form.amount_czk.value/(currency_data.rate/currency_data.unit)
    },
	langChanged: function(lang){
		this.lang = lang;
		document.body.setAttribute('lang', lang);
		this.loadCurrencies();
	}
}

$(document).on("pagecreate", "#pageOne", function(event){
    prevodnik.init();
});
