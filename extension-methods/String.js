String.prototype.contains = function(term){
	return this.indexOf(term) > -1;
};

String.prototype.replaceAll = function (from, to) {
	if (from == ".")
		return this.replace(/\./g, to);

	var rgx = new RegExp(from, 'g');
	return this.replace(rgx, to);
};

if (!String.prototype.startsWith) {
    String.prototype.startsWith = function(searchString, position){
      position = position || 0;
      return this.substr(position, searchString.length) === searchString;
  };
}