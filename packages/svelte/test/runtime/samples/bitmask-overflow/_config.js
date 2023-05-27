export default {
	html: `
		<p>0</p>
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
		<p>27</p>
		<p>28</p>
		<p>29</p>
		<p>30</p>
		<p>31</p>
		<p>32</p>
		<p>33</p>
		<p>34</p>
		<p>35</p>
		<p>36</p>
		<p>37</p>
		<p>38</p>
		<p>39</p>
		<p>40</p>
		<p>5:36</p>
		<p>6:37</p>
		<p>38</p>
	`,

	test({ assert, component, target }) {
		component.reads = {};

		component._0 = 'a';
		component._30 = 'b';
		component._31 = 'c';
		component._32 = 'd';
		component._40 = 'e';

		component._5 = 'f';
		component._6 = 'g';
		component._36 = 'h';
		component._37 = 'i';

		assert.htmlEqual(
			target.innerHTML,
			`
			<p>a</p>
			<p>1</p>
			<p>2</p>
			<p>3</p>
			<p>4</p>
			<p>f</p>
			<p>g</p>
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
			<p>27</p>
			<p>28</p>
			<p>29</p>
			<p>b</p>
			<p>c</p>
			<p>d</p>
			<p>33</p>
			<p>34</p>
			<p>35</p>
			<p>h</p>
			<p>i</p>
			<p>38</p>
			<p>39</p>
			<p>e</p>
			<p>f:h</p>
			<p>g:i</p>
			<p>38</p>
		`
		);

		assert.deepEqual(component.reads, {
			_0: 1,
			_5: 3,
			_6: 3,
			_30: 1,
			_31: 1,
			_32: 1,
			_36: 3,
			_37: 3,
			_40: 1
		});
	}
};
