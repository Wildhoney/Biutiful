import babylon from 'babylon';

export default function parse(code) {

    return babylon.parse(code, {
        sourceType: 'module'
    });

}
