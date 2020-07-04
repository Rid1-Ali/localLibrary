class head {
    constructor(name, size) {
        this.name = name;
        this.size = size;
    }
}

var data = {
    name = 4,
    size = 5
}

var z = new head(data);

console.log(z.name);
console.log(z.size);