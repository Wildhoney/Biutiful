import PrettyError from 'pretty-error';

const pe = new PrettyError();

export default function handle(error) {
    const renderedError = pe.render(new Error(error));
    console.log(renderedError);
}