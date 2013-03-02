<!DOCTYPE html PUBLIC "-//W3C//DTD HTML 4.01//EN" "http://www.w3.org/TR/html4/strict.dtd">
<html lang="en">
	<head>
		<meta http-equiv="Content-Type" content="text/html; charset=iso-8859-1">
		<title>Tree Proof Generator</title>
		<link rel="stylesheet" href="stile.css" type="text/css">
		<script type="text/javascript" src="jquery.js"></script>
		<script type="text/javascript" src="prover.js"></script>
		<script type="text/javascript" src="tableau.js"></script>
	</head>
	<body>

	<div id="titlebar">
	</a>
	</div>
	
	<table id="formtable">
		<tbody><tr>
		<td></td>
		<td id="symboltd">
			<div class="symbutton">
				<img src="./images/neg.png" alt="\neg" align="bottom">
			</div>
			<div class="symbutton">
				<img src="./images/wedge.png" alt="\land" align="bottom">
			</div>
			<div class="symbutton">
				<img src="./images/vee.png" alt="\lor" align="bottom">
			</div>
			<div class="symbutton">
				<img src="./images/to.png" alt="\rightarrow" align="bottom">
			</div>
			<div class="symbutton">
				<img src="./images/leftrightarrow.png" alt="\leftrightarrow" align="bottom">
			</div>
			<div class="symbutton">
				<img src="./images/forall.png" alt="\forall" align="bottom">
			</div>
			<div class="symbutton">
				<img src="./images/exists.png" alt="\exists" align="bottom">
			</div>
		</td>
		</tr>
		<tr>
		<td id="submittd"><input type="submit" value="Prove" class="orangeButton"></td>
		<td>
			<!--<input type="text" size="200" name="flaField" id="inputField" value="\exists y\exists z\forall x((Fx\rightarrow Gy)\land (Gz\rightarrow Fx))\rightarrow\forall x\exists y(Fx\leftrightarrow Gy)">-->
			<!--<input type="text" size="200" name="flaField" id="inputField" value="(P\lor (Q\land R))\to ((P\lor Q)\land (P\lor R))">-->
			<input style="width: 700px;" type="text" size="200" name="flaField" id="inputField" value="\exists y\exists z\forall x((Fx\to Gy)\land (Gz\to Fx))\to\forall x\exists y(Fx\leftrightarrow Gy)">
		</td>
		</tr>
		<tr>
		<td>&nbsp;</td><td id="renderedFla" class="formula"></td></tr>
	</tbody></table>
	
	<div id="statusBox">
		<div id="statusHeader"> </div>
		<div id="status"> </div>
		<button id="statusStop" class="orangeButton">stop</button>
	</div>
	
	<div id="model"> </div>
	<div id="rootAnchor"> </div>
	
	<div id="paintBar">
		<button id="paintStop" class="orangeButton">stop</button>
		<button id="paintFaster" class="orangeButton">faster</button>
	</div>
	<div id="mixpanel" style="visibility: hidden; "></div>
</body>
</html>