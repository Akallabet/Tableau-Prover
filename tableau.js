(function( $ )
{
	var percentage= 0;
	var brackets;
	var root_formula= null;
	var methods =
	{
		init: function(formula)
		{
			root_formula= formula;
			
		}
	}
	
	var sets= {
		
	}
	
	var errors={
		generic: "Errore nell esecuzione dello script",
		formula: "Formula non inserita correttamente",
		format: "Formula non correttamente formattata"
	}
	
    //attrs - need to be accessible only to the app, user can't override
	var attrs = {
    	'results':"",
    	'public_methods': ["init"]
    }
    
	$.fn.tableau = function(method)
	{
        if ( methods[method] && (attrs.public_methods.indexOf(method) >=0))
        {
        	return methods[method].apply( this, Array.prototype.slice.call( arguments, 1 ));
        }
        else if ( typeof method === 'string' || ! method || typeof method=='object')
        {
        	return methods.init.apply( this, arguments);
        }
        else
        {
            $.error( ' The method ' +  method + ' is not a public place engine method' );
        }
    };
})(jQuery);