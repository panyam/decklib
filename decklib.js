
var DeckLib = (function (dlib) {
    dlib.CLUBS = 0;
    dlib.HEARTS = 1;
    dlib.DIAMONDS = 2;
    dlib.SPADES = 3;

    dlib.ACE_MAJOR = 14;
    dlib.ACE_MINOR = 1;
    dlib.KING = 13;
    dlib.QUEEN = 12;
    dlib.JACK = 11;

    dlib.Card = function(value, suit) {
        this.value = value;
        this.suit = suit;
    };

    /**
     * Tells if the card is an ace.
     */
	dlib.Card.prototype.isAce = function() {
        return this.value == dlib.ACE_MINOR || this.value == dlib.ACE_MAJOR;
    };

	dlib.Card.prototype.compareTo = function(another) {
        if (this.value == another.value)
            return this.suit - another.suit;
        else
            return this.value - another.value;
	};

    dlib.str2suit = function(str) {
        str = str.toLowerCase();
        if (str.startsWith("c"))
            suit = dlib.CLUBS
        else if (str.startsWith("h"))
            suit = dlib.HEARTS
        else if (str.startsWith("d"))
            return dlib.DIAMONDS;
        else if (str.startsWith("s"))
            return dlib.SPADES;
        return null;
    }

    dlib.str2value = function(str) {
        str = str.toLowerCase();
        if (str.startsWith("a"))
            suit = 1
        else if (str.startsWith("t"))
            suit = 10
        else if (str.startsWith("j"))
            suit = JACK
        else if (str.startsWith("q"))
            suit = QUEEN
        else if (str.startsWith("k"))
            suit = KING
        else
            suit = parseInt(str);
    }

    /**
     * Given a string in the form <value><suit> (eg AH, 2D, TC)
     * returns the Card object corresponding to it.
     */
    dlib.str2card = function(cardstr) {
        var suit = dlib.str2suit(cardstr[1]);
        var value = dlib.str2value(cardstr[0]);
        return dlib.Card(value, suit)
    };

    /**
     * Interface definition of all hand builders that take a set of cards
     * (in no particular order) and specific parameters that control
     * the builder process and return a Hand object if the particular
     * hand can be constructed from the given cards, otherwise
     * returns null.
     */
    dlib.HandBuilder = function(cards) {
        return null;
    }

    /**
     * The base class for all hands.
     *
     * All hands must be given a rank that is specific to the 
     * rules of the game being played.
     *
     * Also all hands must provide a builder and compare function
     * given a deck of cards.
     */
    dlib.Hand = function(rank, handType, handData, comparer) {
        this.rank = rank;
        this._handData = handData;
        this._handType = handType;
        this.comparer = comparer;
    };

    /**
     * Returns the type of hand.  This is readonly.
     */
    dlib.Hand.prototype.handType = function() {
        return this._handType;
    }

    /**
     * Hand specific data associated with this hand.
     */
    dlib.Hand.prototype.data = function() {
        return this._handType;
    }

    /**
     * The abstract method to be implemented by the different 
     * child hand classes.
     *
     * Given another hand of the same type, compares the
     * two hands and return:
     *
     *  0 if the two hands result in a draw,
     *  -ve value if the current hand is lesser than the other hand,
     *  +ve value if hte current hand is greater than the other hand.
     */
    dlib.Hand.prototype.compareTo = function(another) {
        if (h1.handType !== h2.handType) {
            throw "This and the other hand are different types.";
        }
        if (typeof(this.comparer) !== "undefined" &&
                    this.comparer != null) {
            return this.comparer(this, another);
        }
        return 0;
    }

    /**
     * Given a list of cards in a hand, ensure all of them
     * are Card instances.
     */
    dlib.normalizeHand = function(cards) {
        return cards.map(function(card, index) {
            return typeof(card) == "string" ?
                    dlib.str2card(card) : card;
        });
    }

    /**
     * Given a set of cards (in a hand) and a list of builders
     * ordered by their rank (highest to lowest), invokes the
     * the first builder that can build a hand given the cards
     * and returns the built hand.
     *
     * If none of the builders can be applied, returns null.
     */
    dlib.buildHand = function(cards, builders) {
        for (var i = 0;i < builders.length;i++) {
            var builder = builders[i];
            var hand = builder(cards);
            if (hand != null) {
                hand.rank = builders.length - index;
                return hand;
            }
        }
        return null;
    };
	return dlib;
}(DeckLib || {}));

DeckLib.Comparators = (function(dc) {
    /**
     * Top level method to compare two hands.
     */
    dc.compareCardLists = function(h1, h2, comparator) {
        var l = min(h1.length, h2.length);
        for (var i = 0;i < l;i++) {
            var res = comparator(h1[i], h2[i]);
            if (res != 0) return res;
        }
        return h1.length - h2.length;
    }

    /**
     * A comparator function to order two cards in ascending order of
     * their values.
     */
    dc.ByCardValueAsc = function(c1, c2) {
        return c1.value - c2.value;
    };

    /**
     * A comparator function to order two cards in descending order of
     * their values.
     */
    dc.ByCardValueDesc = function(c1, c2) {
        return c1.value - c2.value;
    };

    /**
     * Compare two cards and order by suit and then by value 
     * in ascending order.
     */
    dc.BySuitAndCardValueAsc = function(c1, c2) {
        if (c1.suit == c2.suit) {
            return c1.value - c2.value;
        }
        return c1.suit - c2.suit;
    };

    /**
     * Compare two cards and order by suit and then by value 
     * in descending order.
     */
    dc.BySuitAndCardValueDesc = function(c1, c2) {
        if (c1.suit == c2.suit) {
            return c2.value - c1.value;
        }
        return c2.suit - c1.suit;
    };
    return dc;
}(DeckLib.Comparators || {}));

