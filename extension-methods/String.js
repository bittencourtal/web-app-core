String.prototype.contains = function(term){
	return this.indexOf(term) > -1;
};

String.prototype.replaceAll = function (from, to) {
	if (from == ".")
		return this.replace(/\./g, to);

	var rgx = new RegExp(from, 'g');
	return this.replace(rgx, to);
};