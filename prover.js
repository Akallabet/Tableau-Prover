var objects= Array();
var parsed= Array();
var brackets= Array();
var root_formula= null;

$(document).ready(function()
{
	$('#submittd>input').live('click',function()
	{
		if($('#inputField').val()!='')
		{
			init($('#inputField').val());
			$('#inputField').tableau(root_formula);
		}
		else console.log('Campo vuoto!');
	});
	
	$(".symbutton>img").click(function()
	{
		var cur_pos= $("#inputField").prop("selectionStart");
		var txt= $('#inputField').val();
		if(cur_pos==0)$('#inputField').val($('#inputField').val()+$(this).attr('alt'));
		else $('#inputField').val(txt.slice(0, cur_pos)+$(this).attr('alt')+txt.slice(cur_pos, txt.length));
	});
});

function init(formula)
{
	var well_formatted= true;
	
	if(fromTextToObjects(formula)) return true;
	else return false;
}

//Functions for translate from test to objects

//Parsing della formula: riempie un array con gli elementi della formula
function fromTextToObjects(f)
{
	var ret= true;
	var start=0;
	var end=0;
	parsed=[];
	objects=[];
	for(var i=0; i<f.length;i++)//First parse formula to create simple objects from strings
	{
		if(f[i]!=" ")
		{
			if(f[i]=="(" || f[i]==")")
			{
				if(checkBrackets({val: f[i], pos: i}, i))
				{
					parsed.push({val: new Separator(f[i]), pos: i});
				}
				else
				{
					ret= false;
					break;
				}
			}
			else if($.inArray(f[i], sets.atoms)!=-1)
			{
				parsed.push({val: new AtomSymbol(f[i]), pos: i});
			}
			else if($.inArray(f[i], sets.variables)!=-1)
			{
				parsed.push({val: new Variable(f[i]), pos: i});
			}
			else if(f[i]=="\\")
			{
				var end=0;
				var type='';
				
				if($.inArray(f.substring(i, end=(parseInt(i)+5)), sets.connectors)!=-1
					|| $.inArray(f.substring(i, end=(parseInt(i)+15)), sets.connectors)!=-1
					|| $.inArray(f.substring(i, end=(parseInt(i)+4)), sets.connectors)!=-1
					|| $.inArray(f.substring(i, end=(parseInt(i)+3)), sets.connectors)!=-1
					|| $.inArray(f.substring(i, end=(parseInt(i)+11)), sets.connectors)!=-1)
				{
					type= "connector";
					parsed.push({val: new Connector(f.substring(i, end)), pos: end-1});
				}
				else if($.inArray(f.substring(i, end=(parseInt(i)+7)), sets.quantificators)!=-1)
				{
					type= "quantificator";
					parsed.push({val: new QuantSing(f.substring(i, end)), pos: end-1});
				}
				else if(f.substring(i, end=(parseInt(i)+4))==sets.negation)
				{
					type= "negation";
					parsed.push({val: new Negation(f.substring(i, end)), pos: end-1});
				}
				i= end-1;
			}
		}
	}
	
	//Remove most external brackets if exist
	if(isSeparator(parsed[0].val) && parsed[0].level==0 && isSeparator(parsed[parsed.length-1]) && parsed[parsed.length-1].level==0)
	  parsed= parsed.slice(1, parsed.length-2);
	
	//Then build more complex objects from simple ones and tree formula
	var level=0;
	var formula= new Formula();
	root_formula= formula;
	formula.level=0;
	formula.name='root, level 0';
	
	$.each(parsed, function(i, element){
	    var first_arr=[];
	    var vars_arr=[];
		if(isSeparator(element.val))
	    {
	        if(element.val.opened)
	        {
	        	level++;
	        	var old_formula= formula;
	        	formula= new Formula();
                old_formula.insert(formula);
                formula.parent= old_formula;
                formula.level=level;
                formula.name= "child level "+level;
	        }
	        else
	        {
	        	level--;
	        	var old_formula= formula;
	        	formula= old_formula.parent;
	        	old_formula.leaf=true;
	        	old_formula.close();
                formula.level=level;
                formula.name= "child level "+level;
	        }
	        element.level= level;
	    }
		else if(!isVariable(element.val))
		{
			if(isQuantSing(element.val))
			{
				for(var j=i+1; j<=parsed.length;j++)
				{
					if(isVariable(parsed[j].val)) vars_arr.push(parsed[j].val);
                    else if(isSeparator(parsed[j].val) && parsed[j].val.opened){}
                    else break;
				}
				if(vars_arr.length==0) trowError('formula', parsed[j].pos);
				else
				{
				    var prev= objects[objects.length-1];
				    if(typeof prev !='undefined' && isNegation(prev) && prev.level==element.level)
				    {
				        first_arr=[prev, element.val];
				        objects.pop();
				    }
				    else first_arr= [element.val];
				    objects.push(new Quantificator($.merge(first_arr, vars_arr)));
				    objects[objects.length-1].level=level;
				}
			}
			else if(isAtomSymbol(element.val))
            {
                for(var j=i+1; j<parsed.length;j++)
                {
                    if(isVariable(parsed[j].val)) vars_arr.push(parsed[j].val);
                    else if(isSeparator(parsed[j].val) && parsed[j].val.opened){}
                    else break;
                }
                
                var prev= objects[objects.length-1];
                if(typeof prev !='undefined' && isNegation(prev) && prev.level==element.level)
                {
                    first_arr=[prev, element.val];
                    objects.pop();
                }
                else first_arr= [element.val];
                objects.push(new AtomFormula($.merge(first_arr, vars_arr)));
                objects[objects.length-1].level=level;
            }
            else if(isConnector(element.val))
            {
                objects.push(element.val);
                objects[objects.length-1].level=level;
            }
            else if(isNegation(element.val))
            {
                objects.push(element.val);
                objects[objects.length-1].level=level;
            }
            var new_obj= objects[objects.length-1];
            formula.insert(new_obj);
		}
	});
	return ret;
}

/*
 * 	OBJECTS
 *  symbol: String
 * 	Var: (symbol)
 * 	Connector: (symbol)
 * 	Negation: (symbol)
 * 	AtomSymbol: (symbol)
 * 	AtomFormula: (AtomSymbol), (negation, AtomSymbol), (AtomSymbol, [var]), (negation, AtomSymbol, [var])
 *  Quantificator: (\forall [var]), (negation \forall [var]), (\exists [var]), (negation \exists [var]);
 *  //Formula: negation (atomFormula connector atomFormula), (atomFormula connector atomFormula) , [quantificator] atomFormula, [quantificator] formula, (atomFormula connector formula), (formula connector formula), negation (formula connector formula)
 */

function Separator(s)
{
    this.symbol=null;
    this.opened=false;
    
    this.getObject= function()
    {
        var ret={};
        if(this.symbol!=null) ret.symbol= this.symbol;
        return ret;
    }
    
    this.toString= function()
    {
    	return this.symbol;
    }
    
    if(isSepSymbol(s))
    {
        this.symbol=s;
        if(s=='(') this.opened=true;
    }
    else return false;
}

function Variable(symb)
{
	this.symbol=null;
	this.getObject= function()
    {
        var ret={};
        if(this.symbol!=null) ret.symbol= this.symbol;
        return ret;
    }
    this.toString= function()
    {
    	return this.symbol;
    }
	if(isVarSymbol(symb)) this.symbol=symb;
	else return false;
}
function Negation(n)
{
	this.symbol= n;
	this.level=null;
	this.getObject= function()
    {
        var ret={};
        if(this.symbol!=null) ret.symbol= this.symbol;
        if(this.level!=null) ret.level= this.level;
        return ret;
    }
    this.toString= function()
    {
    	return this.symbol;
    }
    
	if(isNegSymbol(n)) this.symbol=n;
	else return false;
}
function Connector(c)
{
	this.symbol= null;
	this.type=null;
	this.level=null;
	this.getObject= function()
    {
        var ret={};
        if(this.symbol!=null) ret.symbol= this.symbol;
        if(this.level!=null) ret.level= this.level;
        return ret;
    }
    this.toString= function()
    {
    	return this.symbol;
    }
    
	if(isConnSymbol(c))
	{
	    this.symbol= c;
	    this.type= getConnectorType(c);
	}
	else return false;
}
function AtomSymbol(l)
{
	this.symbol= null;
	this.getObject= function()
    {
        var ret={};
        if(this.symbol!=null) ret.symbol= this.symbol;
        return ret;
    }
    this.toString= function()
    {
    	return this.symbol;
    }
	if(isAtm(l)) this.symbol= l;
	else return false;
}
function QuantSing(q)
{
	this.symbol= null;
	this.getObject= function()
    {
        var ret={};
        if(this.symbol!=null) ret.symbol= this.symbol;
        return ret;
    }
    this.toString= function()
    {
    	return this.symbol;
    }
	if(isQuantSymbol(q)) this.symbol= q;
	else return false;
}


//Quantificator: (\forall var), (negation \forall [var]), (\exists [var]), (negation \exists [var]);
function Quantificator(par)
{
    this.negation= null;
	this.symbol= null;
	this.type=null;
	this.variables= [];
	this.level=null;
	
	this.getObject= function()
    {
        var ret={};
        if(this.negation!=null) ret.negation= this.negation;
        if(this.symbol!=null) ret.symbol= this.symbol;
        if(this.type!=null) ret.type= this.type;
        if(this.variables.length>0) ret.variables= this.variables;
        if(this.level.length>0) ret.level= this.level;
        return ret;
    }
    this.isExistential= function()
    {
        if(this.type=='existential') return true;
        else return false;
    }
    this.isUniversal= function()
    {
        if(this.type=='universal') return true;
        else return false;
    }
    this.toString= function()
    {
    	var ret= this.symbol.toString();
    	if(this.variables.length>0) ret+= "("+this.variables.join(' ')+")";
    	return ret;
    }
    
	if($.isArray(par))
	{
	    var initVars= 1;
		if(par.length>1)
		{
			if(isNegation(par[0]) && isQuantSing(par[1]))
			{
				this.negation= par[0];
				this.symbol= par[1];
				initVars=2;
			}
			else if(isQuantSing(par[0]))
            {
                this.symbol= par[0];
                initVars=1;
            }
			var obj= this;
			$.each(par.slice(initVars,par.length), function(i, v){
			    if(isVariable(v)) obj.variables.push(v);
			});
			if(this.symbol!=null)
			{
			    if(isExistential(this.symbol.symbol))
			    {
			        if(this.negation==null) this.type= 'existential';
			        else this.type= 'universal';
			    }
			    else if(isUniversal(this.symbol.symbol))
			    {
			        if(this.negation==null) this.type= 'universal';
                    else this.type= 'existential';
			    }
			}
		}
		else return false;
	}
	else return false;
}

//AtomFormula: (symbol), (negation, symbol), (symbol, [var]), (negation, symbol, [var])
function AtomFormula(par)
{
	this.atom_symbol=null;
	this.negation=null;
	this.variables=[];
	this.level=null;
	this.getObject= function()
    {
        var ret={};
        if(this.negation!=null) ret.negation= this.negation;
        if(this.atom_symbol!=null) ret.atom_symbol= this.atom_symbol;
        if(this.variable!=null) ret.variables= this.variables;
        if(this.level!=null) ret.level= this.level;
        return ret;
    }
    
    this.toString= function()
    {
    	var ret= this.atom_symbol.toString();
    	if(this.variables.length>0) ret+= "("+this.variables.join(' ')+")";
    	return ret;
    }
    
	if($.isArray(par))
	{
		if(par.length==1)
		{
			if(isAtomSymbol(par[0])) this.atom_symbol= par[0];
			else return false;
		}
		else if(par.length>1)
		{
		    var initVars=1;
			if(isNegation(par[0]) && isAtomSymbol(par[1]))
			{
				this.negation= par[0];
				this.atom_symbol= par[1];
				initVars=2;
			}
			else if(isAtomSymbol(par[0]))
			{
				this.atom_symbol= par[0];
				initVars=1;
			}
			var obj= this;
            $.each(par.slice(initVars,par.length), function(i, v){
                if(isVariable(v)) obj.variables.push(v);
            });
		}
		else return false;
	}
}

//Formula: negation (atomFormula connector atomFormula), (atomFormula connector atomFormula) , [quantificator] atomFormula, [quantificator] formula, (atomFormula connector formula), (formula connector formula), negation (formula connector formula)
//Tree structure
function Formula()
{
    this.negation=null;
	this.left=null;
	this.right=null;
	this.connector=null;
	this.quantificators=[];
	this.parent=null;
	this.level=null;
    this.name=null;
    this.variables=[];
    this.constants=[];
    this.free_variables=[];
    this.leaf=false;
    
	this.isEmpty= function(){
	    if(this.negation==null && this.left==null && this.right==null && this.connector==null) return true;
	    else return false;
	}
	
	this.close= function()
	{
	    this.quantificators= $.merge([], this.parent.quantificators);
        this.parent.quantificators=[];
	}
	
	this.insert= function(obj){
	    if(isNegation(obj)) this.negation= obj;
	    else if(isQuantificator(obj))
	    {
	        //console.log(obj.toString());
	        this.quantificators.push(obj);
	        /*
    	    if(this.left==null) this.left=[obj];
    	    else if($.isArray(this.left)) this.left.push(obj);
    	    else if(this.right==null) this.right=[obj];
    	    else if($.isArray(this.right)) this.right.push(obj);
    	    */
    	}
    	else if(isConnector(obj))
    	{
    	    this.connector= obj;
    	}
    	else
        {
            if(this.left==null)
            {
                this.left=obj;
                /*
                if(isFormula(this.left))
                {
                    this.left.quantificators= $.merge([], this.quantificators);
                    this.quantificators=[];
                }*/
            }
            else if(this.right==null)
            {
                this.right= obj;
                /*
                if(isFormula(this.right))
                {
                    this.right.quantificators= $.merge([], this.quantificators);
                    this.quantificators=[];
                }*/
            }
        }
	}
	this.addVariable= function(v){
		var found=false;
		$.each(this.variables, function(i, vars){
			
		});
	}
	this.addConstant= function(c){
		
	}
	this.toString= function(){
		var ret="";
		if(this.left)
		{
    		if(isFormula(this.left))
    			ret+="("+this.left.toString()+")";
    		else ret+=this.left.toString();
    		ret+= " "+this.connector+" ";
		}
		if(this.right)
		{
        	if(isFormula(this.right))
        		ret+="("+this.right.toString()+")";
        	else ret+=this.right.toString();
        }
		return ret
	};
}

//Controllo che le parentesi siano correttamente inserite
function checkBrackets(bracket)
{
	var ret= true;
	if(bracket.val=="(")
	{
		brackets.push(bracket);
	}
	else
	{
		if(brackets[brackets.length-1].val=="(")
		{
		    brackets[brackets.length-1].pos;
		}
		else
		{
			trowError('format', pos);
			ret= false;
		}
	}
	return ret;
}

function trowError(type, pos)
{
	console.log(errors[type]+": colonna "+pos);
}

function isVariable(v){return (v instanceof Variable) ? true : false;}
function isVarSymbol(str){return ($.inArray(str, sets.variables)!=-1) ? true : false;}

function isConnector(c){return (c instanceof Connector) ? true : false;}
function isConnSymbol(str){return ($.inArray(str, sets.connectors)!=-1) ? true : false;}

function getConnectorType(c){
    if(c==sets.connectors[0]) return 'notimplication';
    if(c==sets.connectors[1]) return 'and';
    if(c==sets.connectors[2]) return 'or';
    if(c==sets.connectors[3] || c==sets.connectors[4]) return 'implication';
}

function isContradiction(c){return (c instanceof Contradiction) ? true : false;}
function isContrSymbol(str){return (str==sets.contradiction);}

function isNegation(c){return (c instanceof Negation) ? true : false;}
function isNegSymbol(str){return (str==sets.negation);}

function isQuantificator(c){return (c instanceof  Quantificator) ? true : false;}
function isQuantSing(c){return (c instanceof  QuantSing) ? true : false;}
function isQuantSymbol(str){return ($.inArray(str, sets.quantificators)!=-1) ? true : false;}

function isExistential(q){return (q==sets.quantificators[1]) ? true : false;}
function isUniversal(q){return (q==sets.quantificators[0]) ? true : false;}

function isSeparator(c){return (c instanceof Separator) ? true : false;}
function isSepSymbol(str){return ($.inArray(str, sets.separators)!=-1) ? true : false;}
function isAtomSymbol(l){return (l instanceof AtomSymbol) ? true : false;}
function isAtm(str){return ($.inArray(str, sets.atoms)!=-1) ? true : false;}

function isAtomFormula(v){return (v instanceof AtomFormula) ? true : false;}
function isFormula(v){return (v instanceof Formula) ? true : false;}

var sets= {
	separators: Array("(",")"," "),
	connectors: Array("\\leftrightarrow","\\land","\\lor","\\rightarrow","\\to"),
	quantificators: Array("\\forall", "\\exists"),
	negation: "\\neg",
	contradiction: "\\bot",
	atoms: Array("A","B","C","D","E","F","G","H","I","J","K","L","M","N","O","P","Q","R","S","T","U","V","X","Y","W","Z"),
	variables: Array("a","b","c","d","e","f","g","h","i","j","k","l","m","n","o","p","q","r","s","t","u","v","x","y","w","z"),
	//atomFormulas: Array("A","a","B","b","C","D","d","E","e","F","f","G","g","H","h","I","i","J","j","K","k","L","l","M","m","N","n",
				//"O","o","P","p","Q","q","R","r","S","s","T","U","u","V","v","X","Y","W","w","Z"),
	//variables: Array("x","y","z","t", "c")
}

var errors={
	generic: "Errore nell esecuzione dello script",
	formula: "Formula non inserita correttamente",
	format: "Formula non correttamente formattata"
}