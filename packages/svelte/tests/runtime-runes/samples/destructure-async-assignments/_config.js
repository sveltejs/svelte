import { test } from '../../test';

export default test({
	html: `
    <button>Update me!</button>
    <p>0</p>
    <p>0</p>
    <p>0</p>
    <p>0</p>
    <p>0</p>
    <p>0</p>
    <p>0</p>
    <p>0</p>
    <p>0</p>
    <p>0</p>
    <p>0</p>
    <p>0</p>
    <p>0</p>
    <p>0</p>
    <p>0</p>
    <p>0</p>
    <p>0</p>
    <p>0</p>
    <p>0</p>
    <p>0</p>
    <p>0</p>
    <p>0</p>
    <p>0</p>
    <p>0</p>
    <p>0</p>
    <p>0</p>
      `,

	async test({ assert, target, window }) {
		const btn = target.querySelector('button');
		const clickEvent = new window.Event('click', { bubbles: true });
		await btn?.dispatchEvent(clickEvent);
		for (let i = 1; i <= 42; i += 1) {
			await Promise.resolve();
		}

		assert.htmlEqual(
			target.innerHTML,
			`
                <button>Update me!</button>
                <p>1</p>
                <p>2</p>
                <p>3</p>
                <p>4</p>
                <p>5</p>
                <p>6</p>
                <p>7</p>
                <p>8</p>
                <p>9</p>
                <p>10</p>
                <p>11</p>
                <p>12</p>
                <p>13</p>
                <p>14</p>
                <p>15</p>
                <p>16</p>
                <p>17</p>
                <p>18</p>
                <p>19</p>
                <p>20</p>
                <p>21</p>
                <p>22</p>
                <p>23</p>
                <p>24</p>
                <p>25</p>
                <p>26</p>
              `
		);
	}
});
